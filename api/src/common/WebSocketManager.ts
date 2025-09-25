import { WebSocket } from 'ws';
import type { DashboardFilters } from '../dashboard/paymet-stats.service.ts';

export interface ClientState {
    filters?: DashboardFilters;
}

export class WebSocketManager {
    private clients: Map<WebSocket, ClientState> = new Map();

    public get hasClientes(): boolean {
        return this.clients.size > 0;
    }

    public get allClients(): IterableIterator<[WebSocket, ClientState]> {
        return this.clients.entries();
    }

    addClient(socket: WebSocket): void {
        this.clients.set(socket, {});
    }

    removeClient(socket: WebSocket): void {
        this.clients.delete(socket);
    }

    updateClientFilters(socket: WebSocket, filters: DashboardFilters): void {
        if (this.clients.has(socket)) {
            this.clients.set(socket, { filters });
        }
    }

    broadcast(data: string): void {
        for (const socket of this.clients.keys()) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(data);
            }
        }
    }
}

export const webSocketManager = new WebSocketManager();
