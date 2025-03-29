import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "gateway",
  brokers: ["kafka-broker:29092"],
});
