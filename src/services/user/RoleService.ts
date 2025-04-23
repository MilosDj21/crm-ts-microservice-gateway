import KafkaClient from "../../kafka/KafkaClient";

class RoleService {
  public findById = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const role = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-role-by-id",
      "response-role-by-id",
    );
    return role;
  };

  public findByUserId = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const roles = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-roles-by-user-id",
      "response-roles-by-user-id",
    );
    return roles;
  };

  public findAll = async () => {
    const kafkaClient = await KafkaClient.getInstance();
    const roles = await kafkaClient.emitEvent(
      {
        data: null,
        error: null,
      },
      "request-roles",
      "response-roles",
    );
    return roles;
  };

  public create = async (name: string) => {
    const kafkaClient = await KafkaClient.getInstance();
    const role = await kafkaClient.emitEvent(
      {
        data: name,
        error: null,
      },
      "request-create-role",
      "response-create-role",
    );
    if (!role) throw new Error("Failed to save role to the db");

    return role;
  };

  public update = async (id: number, name: string) => {
    const kafkaClient = await KafkaClient.getInstance();
    const role = await kafkaClient.emitEvent(
      {
        data: { id, name },
        error: null,
      },
      "request-update-role",
      "response-update-role",
    );
    return role;
  };

  public removeById = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const role = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-remove-role",
      "response-remove-role",
    );
    return role;
  };
}

export default RoleService;
