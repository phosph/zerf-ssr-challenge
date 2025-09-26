import { describe, it, beforeEach, afterEach } from 'mocha';
import { strict as assert } from 'node:assert';
import * as sinon from 'sinon';
import { EventsRepository, type IShift4Event } from '../../src/common/repositories/events.repository.ts';
import { Shift4EventsService } from '../../src/common/Shift4Events.service.ts';
import type { Env } from '../../src/env.ts';

describe('Shift4EventsService', () => {
  let mockEventsRepo: sinon.SinonStubbedInstance<EventsRepository>;
  let service: Shift4EventsService;
  let fetchStub: sinon.SinonStub;

  const mockConfig: Env = {
    SHIFT4_URL: 'https://api.shift4.com',
    SHIFT4_PRIVATE_KEY: 'sk_test_123',
  } as Env;

  beforeEach(() => {
    mockEventsRepo = sinon.createStubInstance(EventsRepository);
    service = new Shift4EventsService(mockConfig, mockEventsRepo);
    fetchStub = sinon.stub(global, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('onEventNotification', () => {
    it('debería detenerse si el evento ya está registrado', async () => {
      const eventId = 'evt_already_registered';
      mockEventsRepo.registerUnprocessedEvent.resolves({ alreadyRegistered: true });

      const steps = service.onEventNotification(eventId);
      
      // Ejecutamos el primer `yield`
      await steps.next();
      // Ejecutamos hasta el final
      const result = await steps.next();

      // Verificamos que el generador terminó y no devolvió nada más
      assert.strictEqual(result.done, true, 'El generador debería haber terminado');
      
      // Usamos las aserciones de sinon para verificar las llamadas
      assert(mockEventsRepo.registerUnprocessedEvent.calledOnceWith(eventId), 'registerUnprocessedEvent no fue llamado correctamente');
      assert(mockEventsRepo.updateUnprocessedEvent.notCalled, 'updateUnprocessedEvent fue llamado incorrectamente');
    });

    it('debería buscar y procesar el evento si es nuevo', async () => {
      const eventId = 'evt_new';
      const mockEventResource: IShift4Event = { id: eventId, type: 'CHARGE_SUCCEEDED', created: Date.now(), objectType: 'event', data: {} };

      // Configuramos los stubs para el flujo de "evento nuevo"
      mockEventsRepo.registerUnprocessedEvent.resolves({ alreadyRegistered: false });
      fetchStub.resolves(new Response(JSON.stringify(mockEventResource), { status: 200 }));
      
      const steps = service.onEventNotification(eventId);
      await steps.next(); // yield registerUnprocessedEvent
      await steps.next(); // fetch y update

      // Verificamos que se llamaron los métodos correctos
      assert(mockEventsRepo.registerUnprocessedEvent.calledOnceWith(eventId));
      assert(mockEventsRepo.updateUnprocessedEvent.calledOnceWith(mockEventResource));
    });
  });

  describe('fetchEvent', () => {
    it('debería devolver el evento si la llamada a la API es exitosa', async () => {
      const eventId = 'evt_success';
      const mockEventResource: IShift4Event = { id: eventId, type: 'TEST_EVENT', created: Date.now(), objectType: 'event', data: {} };

      fetchStub.resolves(new Response(JSON.stringify(mockEventResource), { status: 200 }));

      const result = await service.fetchEvent(eventId);

      assert.deepStrictEqual(result, mockEventResource);
      // Verificamos que fetch fue llamado con los argumentos correctos
      assert(fetchStub.calledOnceWith(
        `${mockConfig.SHIFT4_URL}/events/${eventId}`,
        sinon.match({ headers: { Authorization: sinon.match.string } })
      ));
      assert(mockEventsRepo.markAsSpam.notCalled, 'markAsSpam no debería ser llamado en un caso de éxito');
    });

    it('debería marcar como spam y lanzar un error si la API devuelve 404', async () => {
      const eventId = 'evt_not_found';
      const errorResponse = { error: { message: 'Not Found' } };

      fetchStub.resolves(new Response(JSON.stringify(errorResponse), { status: 404 }));

      await assert.rejects(
        async () => service.fetchEvent(eventId),
        (err: any) => {
          assert.deepStrictEqual(err, errorResponse, 'El error lanzado no es el esperado');
          return true;
        },
        'El método debería haber lanzado un error'
      );

      assert(mockEventsRepo.markAsSpam.calledOnceWith(eventId), 'markAsSpam debería haber sido llamado con el eventId');
    });

    it('debería lanzar un error si la API devuelve otro código de error', async () => {
      const eventId = 'evt_server_error';
      const errorResponse = { error: { message: 'Internal Server Error' } };

      fetchStub.resolves(new Response(JSON.stringify(errorResponse), { status: 500 }));

      await assert.rejects(
        async () => service.fetchEvent(eventId),
        errorResponse,
        'El método debería haber lanzado el cuerpo del error'
      );
      
      assert(mockEventsRepo.markAsSpam.notCalled, 'markAsSpam no debería ser llamado en un error 500');
    });
  });
});
