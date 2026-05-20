export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  dropPercent: number;
  currentPrice: number;
  movingAverage: number;
}

/**
 * Detects abnormal price drop vs moving average (default threshold: 50%).
 */
export function detectPriceAnomaly(
  currentPrice: number,
  movingAverage: number,
  dropThreshold: number,
): AnomalyDetectionResult {
  const safeCurrent = Number.isFinite(currentPrice) ? currentPrice : 0;
  const safeAverage = Number.isFinite(movingAverage) ? movingAverage : 0;

  if (safeAverage <= 0 || safeCurrent <= 0) {
    return {
      isAnomaly: false,
      dropPercent: 0,
      currentPrice: safeCurrent,
      movingAverage: safeAverage,
    };
  }

  const dropPercent = ((safeAverage - safeCurrent) / safeAverage) * 100;
  const isAnomaly = dropPercent > dropThreshold * 100;

  return {
    isAnomaly,
    dropPercent: Math.max(0, Math.round(dropPercent * 100) / 100),
    currentPrice: safeCurrent,
    movingAverage: safeAverage,
  };
}
