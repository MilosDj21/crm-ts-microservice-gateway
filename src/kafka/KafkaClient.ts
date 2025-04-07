import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";

import { GatewayTimeoutError } from "../middlewares/CustomError";

class KafkaClient {
  private static singleInstance: KafkaClient;
  private kafka;
  private producer;
  private consumer;
  private pendingRequests;

  private constructor() {
    this.kafka = new Kafka({
      clientId: "gateway",
      brokers: ["kafka-broker:29092"],
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "auth-service-group" });
    this.pendingRequests = new Map();
  }

  static async getInstance() {
    if (!this.singleInstance) {
      this.singleInstance = new KafkaClient();
      await this.singleInstance.producer.connect();
      await this.singleInstance.consumer.connect();
    }
    return this.singleInstance;
  }

  async emitEvent(
    requestData: any,
    requestTopic: string,
    responseTopic: string,
  ) {
    const correlationId = uuidv4();
    await this.consumer.subscribe({
      topic: responseTopic,
      fromBeginning: false,
    });

    // Set up a promise and store its resolve and reject methods
    const responsePromise = new Promise((resolve, reject) => {
      // Create a timeout for the response
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        reject(
          new GatewayTimeoutError(
            "Gateway Timeout",
            `Gateway ${requestTopic} failed`,
          ),
        );
      }, 10000);

      // Store the pending request in the map
      this.pendingRequests.set(correlationId, { resolve, reject, timeout });
    });

    // Run the consumer to check for matching responses
    this.consumer.run({
      eachMessage: async ({ message }) => {
        if (
          message.headers &&
          message.headers["correlationId"] &&
          message.headers["correlationId"].toString() === correlationId
        ) {
          // If a matching pending request exists, resolve it
          if (this.pendingRequests.has(correlationId) && message.value) {
            const { resolve, timeout } =
              this.pendingRequests.get(correlationId);
            clearTimeout(timeout);
            this.pendingRequests.delete(correlationId);
            resolve(message.value.toString());
          }
        }
      },
    });

    // Send the request with the correlationId header
    await this.producer.send({
      topic: requestTopic,
      messages: [
        {
          value: JSON.stringify(requestData),
          headers: { correlationId },
        },
      ],
    });

    // Wait for the response promise to resolve
    const response: any = await responsePromise;
    await this.producer.disconnect();
    await this.consumer.disconnect();
    return JSON.parse(response);
  }

  public disconnect = async () => {
    try {
      await this.consumer.disconnect();
      await this.producer.disconnect();
      console.log("Kafka connections closed gracefully.");
    } catch (err) {
      console.error("Error during Kafka disconnect:", err);
    }
  };
}

export default KafkaClient;
