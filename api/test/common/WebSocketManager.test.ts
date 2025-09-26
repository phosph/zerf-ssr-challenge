import { describe, it, beforeEach, afterEach } from 'mocha';
import { strict as assert } from 'node:assert';
import * as sinon from 'sinon';
import { WebSocket } from 'ws';
import { WebSocketManager, type ClientState } from '../../src/common/WebSocketManager.ts';
import type { DashboardFilters } from 'common/dashboard/types';

// Función auxiliar para crear un mock de WebSocket
const createMockSocket = (readyState: number = WebSocket.OPEN) => {
  return {
    readyState,
    send: sinon.stub(),
    // Añade otros métodos/propiedades de WebSocket si son necesarios
  } as unknown as WebSocket;
};

describe('WebSocketManager', () => {
  let manager: WebSocketManager;

  beforeEach(() => {
    manager = new WebSocketManager();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addClient', () => {
    it('debería añadir un cliente al mapa y establecer hasClients a true', () => {
      const socket = createMockSocket();
      assert.strictEqual(manager.hasClients, false, 'Inicialmente no debería haber clientes');

      manager.addClient(socket);

      assert.strictEqual(manager.hasClients, true, 'Debería haber clientes después de añadir uno');
      const clients = Array.from(manager.allClients);
      assert.strictEqual(clients.length, 1);
      assert.deepStrictEqual(clients[0], [socket, {}]); // El estado inicial es un objeto vacío
    });
  });

  describe('removeClient', () => {
    it('debería eliminar un cliente del mapa', () => {
      const socket = createMockSocket();
      manager.addClient(socket);
      assert.strictEqual(manager.hasClients, true);

      manager.removeClient(socket);

      assert.strictEqual(manager.hasClients, false, 'No debería haber clientes después de eliminarlo');
    });
  });

  describe('updateClientFilters', () => {
    it('debería actualizar el estado de filtros de un cliente existente', () => {
      const socket = createMockSocket();
      const filters: DashboardFilters = {
          status: ['successful'],
          startDate: ''
      };
      manager.addClient(socket);

      manager.updateClientFilters(socket, filters);

      const clientState = Array.from(manager.allClients)[0][1] as ClientState;
      assert.deepStrictEqual(clientState.filters, filters);
    });

    it('no debería hacer nada si el cliente no existe', () => {
      const socket = createMockSocket();
      const filters: DashboardFilters = {
          status: ['failed'],
          startDate: ''
      };

      // No se espera que lance un error
      manager.updateClientFilters(socket, filters);

      assert.strictEqual(manager.hasClients, false);
    });
  });

  describe('broadcast', () => {
    it('debería enviar un mensaje a todos los clientes con estado OPEN', () => {
      const socket1 = createMockSocket(WebSocket.OPEN);
      const socket2 = createMockSocket(WebSocket.OPEN);
      const socket3 = createMockSocket(WebSocket.CLOSED); // Socket cerrado

      manager.addClient(socket1);
      manager.addClient(socket2);
      manager.addClient(socket3);

      const message = 'Hola a todos';
      manager.broadcast(message);

      assert((socket1.send as sinon.SinonStub).calledOnceWith(message), 'El socket 1 no recibió el mensaje');
      assert((socket2.send as sinon.SinonStub).calledOnceWith(message), 'El socket 2 no recibió el mensaje');
      assert((socket3.send as sinon.SinonStub).notCalled, 'El socket 3 (cerrado) no debería haber recibido el mensaje');
    });
  });

  describe('Getters', () => {
    it('hasClients debería devolver el estado correcto', () => {
      assert.strictEqual(manager.hasClients, false);
      manager.addClient(createMockSocket());
      assert.strictEqual(manager.hasClients, true);
    });

    it('allClients debería devolver un iterador con todos los clientes y sus estados', () => {
      const socket1 = createMockSocket();
      const socket2 = createMockSocket();
      manager.addClient(socket1);
      manager.addClient(socket2);

      const clientsArray = Array.from(manager.allClients);
      assert.strictEqual(clientsArray.length, 2);
      assert.strictEqual(clientsArray[0][0], socket1);
      assert.strictEqual(clientsArray[1][0], socket2);
    });
  });
});
