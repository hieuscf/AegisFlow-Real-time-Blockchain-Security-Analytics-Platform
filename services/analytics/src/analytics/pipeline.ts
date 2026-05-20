import { detectPriceAnomaly } from "../anomaly/detector";
import { createAlert } from "../alerts/engine";
import { runContractAudit } from "../audit/slither";
import { loadConfig } from "../config/env";
import { saveAlert, saveAuditResult } from "../database/repository";
import { publishSecurityAlert } from "../kafka/producer";
import type { SwapEvent } from "../models/types";
import { getTokenPrices, pushTokenPrice } from "../redis/client";
import { broadcastAlert, broadcastPriceUpdate } from "../websocket/hub";
import {
  calculateMovingAverage,
  calculateRealtimePrice,
} from "./priceEngine";

const LOG_PREFIX = "[pipeline]";

export interface TokenAnalyticsContext {
  swap: SwapEvent;
  tokenAddress: string;
  price: number;
}

/**
 * Runs full analytics for one token price sample from a swap event.
 */
export async function runTokenAnalytics(
  context: TokenAnalyticsContext,
): Promise<void> {
  const { swap, tokenAddress, price } = context;
  const config = loadConfig();

  if (price <= 0) {
    return;
  }

  await pushTokenPrice(tokenAddress, price);
  const recentPrices = await getTokenPrices(tokenAddress);
  const movingAverage = calculateMovingAverage(recentPrices);

  broadcastPriceUpdate({
    type: "PRICE_UPDATE",
    tokenAddress,
    price,
    movingAverage,
    pairAddress: swap.pairAddress,
    txHash: swap.txHash,
    timestamp: new Date().toISOString(),
  });

  const anomaly = detectPriceAnomaly(
    price,
    movingAverage,
    config.anomaly.dropThreshold,
  );

  if (!anomaly.isAnomaly) {
    return;
  }

  console.warn(
    `${LOG_PREFIX} Anomaly token=${tokenAddress} drop=${anomaly.dropPercent}%`,
  );

  const alert = await createAlert({
    level: "CRITICAL",
    type: "CRITICAL_ALERT",
    title: "Abnormal price drop detected",
    message:
      `Price dropped ${anomaly.dropPercent}% vs moving average ` +
      `(current=${price.toFixed(8)}, avg=${movingAverage.toFixed(8)})`,
    tokenAddress,
    contractAddress: tokenAddress,
    pairAddress: swap.pairAddress,
    txHash: swap.txHash,
    metadata: {
      dropPercent: anomaly.dropPercent,
      currentPrice: price,
      movingAverage,
    },
  });

  if (!alert) {
    return;
  }

  await saveAlert(alert);
  await publishSecurityAlert(alert);

  const audit = await runContractAudit(tokenAddress);
  const auditId = await saveAuditResult(audit);

  const auditAlert = await createAlert({
    level: audit.success ? "WARNING" : "INFO",
    type: "AUDIT_COMPLETE",
    title: "Smart contract audit finished",
    message: audit.success
      ? `Slither scan completed for ${tokenAddress}`
      : `Audit failed for ${tokenAddress}: ${audit.errorMessage ?? "unknown"}`,
    tokenAddress,
    contractAddress: tokenAddress,
    pairAddress: swap.pairAddress,
    metadata: { auditId, risks: audit.risks, findingsCount: audit.findings.length },
    skipDedupe: true,
  });

  if (auditAlert) {
    await saveAlert(auditAlert);
  }
}

/**
 * Processes both pool tokens for a swap event.
 */
export async function processSwapAnalytics(swap: SwapEvent): Promise<void> {
  const prices = calculateRealtimePrice(swap);

  await runTokenAnalytics({
    swap,
    tokenAddress: swap.token0,
    price: prices.token0PriceInToken1,
  });

  await runTokenAnalytics({
    swap,
    tokenAddress: swap.token1,
    price: prices.token1PriceInToken0,
  });
}
