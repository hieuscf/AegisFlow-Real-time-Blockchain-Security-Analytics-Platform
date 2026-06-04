import { calculateRealtimePrice } from "../analytics/priceEngine";
import type { MockConfig } from "./config";
import { MOCK_TOKEN0 } from "./constants";
import type { MockKafkaProducer } from "./kafkaProducer";
import { buildSwapEvent } from "./swapBuilder";

const LOG_PREFIX = "[MOCK]";

const NORMAL_WALK_MIN_PCT = 0.01;
const NORMAL_WALK_MAX_PCT = 0.03;
const CRASH_RETAIN_MIN = 0.05;
const CRASH_RETAIN_MAX = 0.2;

export class MarketSimulator {
  private currentPrice: number;
  private swapTimer: NodeJS.Timeout | null = null;
  private crashTimer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly config: MockConfig,
    private readonly producer: MockKafkaProducer,
    initialPrice?: number,
  ) {
    this.currentPrice = initialPrice ?? config.initialPriceUsd;
  }

  startSimulation(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    console.log(
      `${LOG_PREFIX} Simulation started initialPrice=${this.currentPrice.toFixed(2)} ` +
        `swapEvery=${this.config.swapIntervalMs}ms crashEvery=${this.config.crashIntervalMs}ms ` +
        `token=${MOCK_TOKEN0}`,
    );

    void this.emitSwap(this.currentPrice);

    this.swapTimer = setInterval(() => {
      void this.tickNormal();
    }, this.config.swapIntervalMs);

    this.crashTimer = setInterval(() => {
      void this.tickCrash();
    }, this.config.crashIntervalMs);
  }

  async stopSimulation(): Promise<void> {
    this.running = false;

    if (this.swapTimer) {
      clearInterval(this.swapTimer);
      this.swapTimer = null;
    }

    if (this.crashTimer) {
      clearInterval(this.crashTimer);
      this.crashTimer = null;
    }

    console.log(`${LOG_PREFIX} Simulation stopped`);
  }

  private async tickNormal(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.currentPrice = applyRandomWalk(this.currentPrice);
    await this.emitSwap(this.currentPrice);
  }

  private async tickCrash(): Promise<void> {
    if (!this.running) {
      return;
    }

    const retainFactor = randomBetween(CRASH_RETAIN_MIN, CRASH_RETAIN_MAX);
    this.currentPrice = this.currentPrice * retainFactor;

    console.log(`${LOG_PREFIX} CRASH EVENT Injected`);
    await this.emitSwap(this.currentPrice);
  }

  private async emitSwap(targetPrice: number): Promise<void> {
    const swap = buildSwapEvent(targetPrice);

    try {
      await this.producer.publishSwap(swap);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${LOG_PREFIX} Failed to publish swap: ${message}`);
      return;
    }

    const derived = calculateRealtimePrice(swap).token0PriceInToken1;
    const loggedPrice = derived > 0 ? derived : targetPrice;
    console.log(`${LOG_PREFIX} Generated Swap Price: ${loggedPrice.toFixed(2)}`);
  }
}

function applyRandomWalk(price: number): number {
  const deltaPct = randomBetween(-NORMAL_WALK_MAX_PCT, NORMAL_WALK_MAX_PCT);
  const clamped =
    Math.abs(deltaPct) < NORMAL_WALK_MIN_PCT
      ? Math.sign(deltaPct || 1) * NORMAL_WALK_MIN_PCT
      : deltaPct;
  const next = price * (1 + clamped);
  return Math.max(next, 0.01);
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function startSimulation(
  config: MockConfig,
  producer: MockKafkaProducer,
): MarketSimulator {
  const simulator = new MarketSimulator(config, producer);
  simulator.startSimulation();
  return simulator;
}
