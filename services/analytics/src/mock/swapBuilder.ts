import { randomBytes } from "node:crypto";

import type { SwapEvent } from "../models/types";
import {
  MOCK_AMOUNT0_IN,
  MOCK_PAIR_ADDRESS,
  MOCK_SENDER,
  MOCK_TOKEN0,
  MOCK_TOKEN1,
  ZERO_AMOUNT,
} from "./constants";

const WEI = 10n ** 18n;
const PRICE_SCALE = 1_000_000n;

let blockSequence = 1_900_000;
let swapSequence = 0;

function randomTxHash(): string {
  return `0x${randomBytes(32).toString("hex")}`;
}

/**
 * Converts a target token0PriceInToken1 (USD-like quote) into amount1Out wei
 * for a swap with amount0In = 1e18 (see priceEngine.ratioPrice).
 */
export function amount1OutForPrice(targetPrice: number): string {
  const safePrice = Math.max(targetPrice, 0.000_001);
  const priceMicro = BigInt(Math.round(safePrice * Number(PRICE_SCALE)));
  const amount1Out = (WEI * priceMicro) / PRICE_SCALE;
  return amount1Out > 0n ? amount1Out.toString() : "1";
}

/**
 * Builds a Uniswap V2-style swap (token0 in → token1 out) so analytics derives
 * token0PriceInToken1 ≈ targetPrice. token1 leg stays zero (skipped in pipeline).
 */
export function buildSwapEvent(targetPrice: number): SwapEvent {
  swapSequence += 1;
  blockSequence += 1;

  return {
    txHash: randomTxHash(),
    pairAddress: MOCK_PAIR_ADDRESS,
    token0: MOCK_TOKEN0,
    token1: MOCK_TOKEN1,
    sender: MOCK_SENDER,
    amount0In: MOCK_AMOUNT0_IN,
    amount1In: ZERO_AMOUNT,
    amount0Out: ZERO_AMOUNT,
    amount1Out: amount1OutForPrice(targetPrice),
    blockNumber: blockSequence,
    timestamp: Math.floor(Date.now() / 1000),
  };
}

export function resetSwapBuilderState(): void {
  blockSequence = 1_900_000;
  swapSequence = 0;
}
