import { formatUnits } from "ethers";

import type { SwapEvent } from "../models/types";

const MVP_DECIMALS = 18;
const PRICE_SCALE = 10n ** BigInt(MVP_DECIMALS);

export interface RealtimePriceResult {
  token0PriceInToken1: number;
  token1PriceInToken0: number;
}

function parseAmount(value: string): bigint {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "0") {
    return 0n;
  }

  try {
    const amount = BigInt(trimmed);
    return amount < 0n ? 0n : amount;
  } catch {
    return 0n;
  }
}

function sanitizePrice(value: number): number {
  if (
    !Number.isFinite(value) ||
    Number.isNaN(value) ||
    value === Infinity ||
    value === -Infinity ||
    value < 0
  ) {
    return 0;
  }
  return value;
}

/**
 * Computes token1-per-token0 and token0-per-token1 from swap amounts using BigInt-safe math.
 */
function ratioPrice(amountOut: bigint, amountIn: bigint): number {
  if (amountIn === 0n || amountOut === 0n) {
    return 0;
  }

  const scaledRatio = (amountOut * PRICE_SCALE) / amountIn;
  const asNumber = Number.parseFloat(
    formatUnits(scaledRatio, MVP_DECIMALS),
  );

  return sanitizePrice(asNumber);
}

/**
 * Derives realtime prices for both pool tokens from a Uniswap V2 swap event.
 */
export function calculateRealtimePrice(swap: SwapEvent): RealtimePriceResult {
  const amount0In = parseAmount(swap.amount0In);
  const amount1In = parseAmount(swap.amount1In);
  const amount0Out = parseAmount(swap.amount0Out);
  const amount1Out = parseAmount(swap.amount1Out);

  let token0PriceInToken1 = 0;
  let token1PriceInToken0 = 0;

  if (amount0In > 0n && amount1Out > 0n) {
    token0PriceInToken1 = ratioPrice(amount1Out, amount0In);
  }

  if (amount1In > 0n && amount0Out > 0n) {
    token1PriceInToken0 = ratioPrice(amount0Out, amount1In);
  }

  if (token0PriceInToken1 > 0 && token1PriceInToken0 === 0) {
    token1PriceInToken0 = sanitizePrice(1 / token0PriceInToken1);
  } else if (token1PriceInToken0 > 0 && token0PriceInToken1 === 0) {
    token0PriceInToken1 = sanitizePrice(1 / token1PriceInToken0);
  }

  return {
    token0PriceInToken1: sanitizePrice(token0PriceInToken1),
    token1PriceInToken0: sanitizePrice(token1PriceInToken0),
  };
}

/**
 * Calculates the arithmetic mean of valid price samples (rounded to 8 decimal places).
 */
export function calculateMovingAverage(prices: number[]): number {
  const valid = prices.filter(
    (price) =>
      Number.isFinite(price) &&
      !Number.isNaN(price) &&
      price !== Infinity &&
      price !== -Infinity &&
      price >= 0,
  );

  if (valid.length === 0) {
    return 0;
  }

  const sum = valid.reduce((total, price) => total + price, 0);
  const average = sum / valid.length;
  const rounded = Math.round(average * 1e8) / 1e8;

  return sanitizePrice(rounded);
}
