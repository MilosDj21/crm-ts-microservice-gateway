import "dotenv/config";

import { createApp } from "./createApp";
import KafkaClient from "./kafka/KafkaClient";

const startServer = async () => {
  const app = createApp();
  const kafkaClient = await KafkaClient.getInstance();

  //starting express server
  const server = app.listen(process.env.PORT, () =>
    console.log(`Listening on port: ${process.env.PORT}`),
  );

  const gracefulShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down...`);
    await kafkaClient.disconnect();
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
