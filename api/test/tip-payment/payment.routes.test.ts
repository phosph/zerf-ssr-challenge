import { describe, it, beforeEach, afterEach } from 'mocha';
import { strict as assert } from 'node:assert';
import * as sinon from 'sinon';
import Fastify, { type FastifyInstance } from 'fastify';
import paymentRoutesPlugin from '../../src/tip-payment/payment.routes.ts';
import { Shift4PaymentService } from '../../src/common/Shift4Payment.service.ts';
import { Shift4EventsService } from '../../src/common/Shift4Events.service.ts';
import type { ITipPaymentBody } from '../../src/tip-payment/tip-payment-body.schema.ts';

describe('Payment Routes', () => {
  let app: FastifyInstance;
  let chargeStub: sinon.SinonStub;
  let onEventNotificationStub: sinon.SinonStub;

  beforeEach(() => {
    app = Fastify();

    // Mock de dependencias
    const mockPgClient = { release: sinon.stub() };
    app.pg = { connect: sinon.stub().resolves(mockPgClient) } as any;
    app.decorate('getEnvs', () => ({})); // Mock para getEnvs
    app.decorateRequest('getEnvs', () => ({ }))

    // Stub para los servicios que se instancian en las rutas
    chargeStub = sinon.stub(Shift4PaymentService.prototype, 'charge');
    onEventNotificationStub = sinon.stub(Shift4EventsService.prototype, 'onEventNotification');

    // Registramos el plugin de rutas en nuestra instancia de prueba de Fastify
    app.register(paymentRoutesPlugin);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /tip/payment', () => {
    const validPayload: ITipPaymentBody = {
      tokenId: 'tok_123',
      amount: 1000,
      country: 'US',
    };

    it('debería devolver 200 y el resultado del servicio si el pago es exitoso', async () => {
      const mockChargeResult = { id: 1, chargeExternalId: 'ch_abc', status: 'successful' };
      chargeStub.resolves(mockChargeResult);

      const response = await app.inject({
        method: 'POST',
        url: '/tip/payment',
        payload: validPayload,
      });

      assert.strictEqual(response.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(response.payload), mockChargeResult);
      assert(chargeStub.calledOnceWith(validPayload), 'Shift4PaymentService.charge no fue llamado con el payload correcto');
    });

    it('debería devolver 400 si el payload es inválido', async () => {
      const invalidPayload = { ...validPayload, amount: 9 }; // amount < minimum

      const response = await app.inject({
        method: 'POST',
        url: '/tip/payment',
        payload: invalidPayload,
      });

      assert.strictEqual(response.statusCode, 400, 'Debería fallar la validación del schema');
    });

    it('debería devolver 500 si el servicio de pago lanza un error', async () => {
      const errorMessage = 'API de Shift4 no disponible';
      chargeStub.rejects(new Error(errorMessage));

      const response = await app.inject({
        method: 'POST',
        url: '/tip/payment',
        payload: validPayload,
      });

      assert.strictEqual(response.statusCode, 500);
      const body = JSON.parse(response.payload);
      assert.strictEqual(body.error, 'Internal Server Error');
      assert((app.pg.connect as sinon.SinonStub).calledOnce, 'No se obtuvo un cliente de la BD');
      // @ts-ignore
      const client = await app.pg.connect.getCall(0).returnValue;
      assert(client.release.calledOnce, 'El cliente de la BD no fue liberado');
    });
  });

  describe('POST /tip/payment-wh', () => {
    it('debería devolver 200 inmediatamente y procesar el evento', async () => {
      const eventId = 'evt_webhook_123';

      // Simulamos el generador asíncrono que devuelve el servicio
      const mockSteps = {
        next: sinon.stub(),
      };
      mockSteps.next.onFirstCall().resolves({ value: undefined, done: false });
      mockSteps.next.onSecondCall().resolves({ value: undefined, done: true });
      onEventNotificationStub.returns(mockSteps);

      const response = await app.inject({
        method: 'POST',
        url: '/tip/payment-wh',
        payload: { id: eventId },
      });

      // La respuesta debe ser inmediata y exitosa
      assert.strictEqual(response.statusCode, 200);

      // Verificamos que el servicio fue llamado correctamente
      assert(onEventNotificationStub.calledOnceWith(eventId), 'onEventNotification no fue llamado con el ID correcto');

      // Esperamos un instante para que las promesas dentro de la ruta se resuelvan
      await new Promise(resolve => setImmediate(resolve));

      // Verificamos que el generador avanzó dos veces
      assert(mockSteps.next.calledTwice, 'El generador no avanzó los pasos esperados');

      // Verificamos que el cliente de la BD fue liberado
      // @ts-ignore
      const client = await app.pg.connect.getCall(0).returnValue;
      assert(client.release.calledOnce, 'El cliente de la BD no fue liberado');
    });

    it('debería devolver 400 si el payload del webhook no tiene id', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tip/payment-wh',
        payload: { some_other_prop: 'abc' }, // Falta el `id`
      });

      assert.strictEqual(response.statusCode, 400);
    });
  });
});
