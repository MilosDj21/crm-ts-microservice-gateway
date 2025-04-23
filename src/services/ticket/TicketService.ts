import { Ticket } from "../../interfaces";
import KafkaClient from "../../kafka/KafkaClient";

class TicketService {
  public findById = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const ticket = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-ticket-by-id",
      "response-ticket-by-id",
    );
    return ticket;
  };

  public findByUserId = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const tickets = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-tickets-by-user-id",
      "response-tickets-by-user-id",
    );
    return tickets;
  };

  public findAll = async () => {
    const kafkaClient = await KafkaClient.getInstance();
    const tickets = await kafkaClient.emitEvent(
      {
        data: null,
        error: null,
      },
      "request-tickets",
      "response-tickets",
    );
    return tickets;
  };

  public create = async (ticketObject: Ticket) => {
    const kafkaClient = await KafkaClient.getInstance();
    const ticket = await kafkaClient.emitEvent(
      {
        data: ticketObject,
        error: null,
      },
      "request-create-ticket",
      "response-create-ticket",
    );
    if (!ticket) throw new Error("Failed to save ticket to the db");

    return ticket;
  };

  public update = async (ticketObject: Ticket) => {
    const kafkaClient = await KafkaClient.getInstance();
    const ticket = await kafkaClient.emitEvent(
      {
        data: ticketObject,
        error: null,
      },
      "request-update-ticket",
      "response-update-ticket",
    );
    return ticket;
  };

  public removeById = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const ticket = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-remove-ticket",
      "response-remove-ticket",
    );
    return ticket;
  };
}

export default TicketService;
