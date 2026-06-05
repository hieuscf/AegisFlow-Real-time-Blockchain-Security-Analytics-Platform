import { exec } from "node:child_process";
import { promisify } from "node:util";

import { loadConfig } from "../config/env";
import { createLogger, logError } from "../logging/logger";
import type { AuditResult } from "../models/types";
import { buildMockAuditResult, parseSlitherOutput } from "./parser";

const execAsync = promisify(exec);
const log = createLogger("audit");

let activeAudits = 0;
const queue: Array<() => void> = [];

async function acquireSlot(maxConcurrent: number): Promise<void> {
  if (activeAudits < maxConcurrent) {
    activeAudits += 1;
    return;
  }

  await new Promise<void>((resolve) => {
    queue.push(resolve);
  });
  activeAudits += 1;
}

function releaseSlot(): void {
  activeAudits = Math.max(0, activeAudits - 1);
  const next = queue.shift();
  if (next) {
    next();
  }
}

/**
 * Runs Slither against a contract address (or mock when disabled).
 */
export async function runContractAudit(
  contractAddress: string,
): Promise<AuditResult> {
  const config = loadConfig();
  const normalized = contractAddress.trim().toLowerCase();

  if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
    return {
      contractAddress: normalized,
      success: false,
      findings: [],
      risks: {
        selfdestruct: false,
        unlimitedMint: false,
        ownershipRisk: false,
      },
      errorMessage: "Invalid contract address",
      completedAt: new Date().toISOString(),
    };
  }

  if (!config.audit.enabled) {
    log.info({ contractAddress: normalized }, "Slither disabled, returning mock result");
    return buildMockAuditResult(normalized);
  }

  await acquireSlot(config.audit.maxConcurrent);

  try {
    const command = `${config.audit.command} ${normalized} --json -`;
    log.info({ command }, "Running Slither");

    const { stdout, stderr } = await execAsync(command, {
      timeout: config.audit.timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
    });

    return parseSlitherOutput(normalized, stdout, stderr);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError(log, "Slither failed", error);

    return {
      contractAddress: normalized,
      success: false,
      findings: [],
      risks: {
        selfdestruct: false,
        unlimitedMint: false,
        ownershipRisk: false,
      },
      errorMessage: message,
      completedAt: new Date().toISOString(),
    };
  } finally {
    releaseSlot();
  }
}
