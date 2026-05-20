import type { AuditFinding, AuditResult } from "../models/types";

interface SlitherDetector {
  check?: string;
  impact?: string;
  confidence?: string;
  description?: string;
}

interface SlitherJson {
  success?: boolean;
  error?: string;
  results?: {
    detectors?: SlitherDetector[];
  };
}

function normalizeCheck(value: string): string {
  return value.toLowerCase();
}

/**
 * Parses Slither JSON output and flags high-risk patterns for MVP.
 */
export function parseSlitherOutput(
  contractAddress: string,
  stdout: string,
  stderr: string,
): AuditResult {
  const completedAt = new Date().toISOString();
  let parsed: SlitherJson | null = null;

  try {
    parsed = JSON.parse(stdout) as SlitherJson;
  } catch {
    return {
      contractAddress,
      success: false,
      findings: [],
      risks: {
        selfdestruct: false,
        unlimitedMint: false,
        ownershipRisk: false,
      },
      rawOutput: stdout,
      errorMessage: stderr || "Invalid Slither JSON output",
      completedAt,
    };
  }

  const detectors = parsed.results?.detectors ?? [];
  const findings: AuditFinding[] = detectors.map((detector) => ({
    check: detector.check ?? "unknown",
    impact: detector.impact ?? "Unknown",
    confidence: detector.confidence ?? "Unknown",
    description: detector.description,
  }));

  let selfdestruct = false;
  let unlimitedMint = false;
  let ownershipRisk = false;

  for (const finding of findings) {
    const check = normalizeCheck(finding.check);

    if (check.includes("suicidal") || check.includes("selfdestruct")) {
      selfdestruct = true;
    }

    if (
      check.includes("mint") ||
      check.includes("unlimited") ||
      check.includes("arbitrary-from")
    ) {
      unlimitedMint = true;
    }

    if (
      check.includes("owner") ||
      check.includes("centralization") ||
      check.includes("proxy")
    ) {
      ownershipRisk = true;
    }
  }

  return {
    contractAddress,
    success: parsed.success !== false,
    findings,
    risks: { selfdestruct, unlimitedMint, ownershipRisk },
    rawOutput: stdout,
    errorMessage: parsed.error,
    completedAt,
  };
}

export function buildMockAuditResult(contractAddress: string): AuditResult {
  return {
    contractAddress,
    success: true,
    findings: [],
    risks: {
      selfdestruct: false,
      unlimitedMint: false,
      ownershipRisk: false,
    },
    rawOutput: "SLITHER_DISABLED",
    completedAt: new Date().toISOString(),
  };
}
