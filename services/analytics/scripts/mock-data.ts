import { loadMockConfig } from "../src/mock/config";
import { MockKafkaProducer } from "../src/mock/kafkaProducer";
import { startSimulation } from "../src/mock/simulator";

const LOG_PREFIX = "[MOCK]";

async function main(): Promise<void> {
  const config = loadMockConfig();
  const producer = new MockKafkaProducer(config);

  await producer.connect();

  const simulator = startSimulation(config, producer);

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`${LOG_PREFIX} Received ${signal}, shutting down…`);
    await simulator.stopSimulation();
    await producer.disconnect();
    process.exit(0);
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`${LOG_PREFIX} Fatal error: ${message}`);
  process.exit(1);
});
