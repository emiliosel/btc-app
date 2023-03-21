import { Response } from "express";
import { UserConnectionsRepository } from "../repositories/user-connection.repository";

interface Connection {
  id: string;
  res: Response;
}

export class SSEConnectionService {
  public readonly connections = new Map<string, Connection[]>();

  constructor(private readonly connectionsRepo: UserConnectionsRepository) {}

  async add(userId: string, connection: Connection) {
    const prevConnections = this.connections.get(connection.id) || [];
    await this.connectionsRepo.saveConnection({ userId, connectionId: connection.id });
    this.connections.set(connection.id, prevConnections.concat(connection));
  }

  async remove(connectionId: string) {
    await this.connectionsRepo.removeConnection(connectionId);
    this.connections.delete(connectionId);
  }

  async getUserConnections(userId: string) {
    const connectionIds = await this.connectionsRepo.getUserConnectionIds(
      userId
    );

    return connectionIds
      .map(conId => this.connections.get(conId))
      .reduce((flattened, conn) => typeof conn !== 'undefined' && conn.length ? (flattened || [])?.concat(conn) : flattened, []) as Connection[]
  }
}
