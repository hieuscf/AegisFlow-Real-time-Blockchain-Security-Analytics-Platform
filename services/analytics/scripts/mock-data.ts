import { createLogger, logError } from "../src/logging/logger";
import { loadMockConfig } from "../src/mock/config";
import { MockKafkaProducer } from "../src/mock/kafkaProducer";
import { startSimulation } from "../src/mock/simulator";

const log = createLogger("mock");

async function main(): Promise<void> {
  const config = loadMockConfig();
  const producer = new MockKafkaProducer(config);

  await producer.connect();

  const simulator = startSimulation(config, producer);

  const shutdown = async (signal: string): Promise<void> => {
    log.info({ signal }, "Shutting down");
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
  logError(log, "Fatal error", error);
  process.exit(1);
});
