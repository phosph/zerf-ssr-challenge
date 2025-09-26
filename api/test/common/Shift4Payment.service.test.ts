import { describe, it, beforeEach, afterEach } from 'mocha';
import { strict as assert } from 'node:assert';
import * as sinon from 'sinon';
import { ChargesRepository } from '../../src/common/repositories/charges.repository.ts';
import { Shift4PaymentService, type IShift4Charge, type IShift4ErrorResponse } from '../../src/common/Shift4Payment.service.ts';
import type { Env } from '../../src/env.ts';
import type { ITipPaymentBody } from '../../src/tip-payment/tip-payment-body.schema.ts';
import { normalizeCharge } from '../../src/common/utils/normalizeCharge.ts';

describe('Shift4PaymentService', () => {
  let mockChargesRepo: sinon.SinonStubbedInstance<ChargesRepository>;
  let service: Shift4PaymentService;
  let fetchStub: sinon.SinonStub;

  const mockConfig: Env = {
    SHIFT4_URL: 'https://api.shift4.com',
    SHIFT4_PRIVATE_KEY: 'sk_test_123',
  } as Env;

  beforeEach(() => {
    mockChargesRepo = sinon.createStubInstance(ChargesRepository);
    service = new Shift4PaymentService(mockConfig, mockChargesRepo);
    fetchStub = sinon.stub(global, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('charge', () => {
    const paymentPayload: ITipPaymentBody = {
      tokenId: 'tok_123',
      amount: 500,
      country: 'US',
    };

    it('debería procesar un cargo exitoso y registrarlo en la base de datos', async () => {
      const mockShift4Charge: IShift4Charge = {
        id: 'ch_abc',
        created: Date.now(),
        objectType: 'charge',
        amount: 500,
        currency: 'USD',
        status: 'successful',
        type: 'customer_initiated',
        description: ''
      };
      const dbId = 42;

      // Simulamos una respuesta exitosa de la API de Shift4
      fetchStub.resolves(new Response(JSON.stringify(mockShift4Charge), { status: 200 }));
      // Simulamos que el repositorio devuelve un ID al registrar el cargo
      mockChargesRepo.registerCharge.resolves(dbId);

      const result = await service.charge(paymentPayload);

      // Verificamos que fetch fue llamado correctamente
      assert(fetchStub.calledOnceWith(`${mockConfig.SHIFT4_URL}/charges`, sinon.match.object));
      
      // Verificamos que el repositorio fue llamado con el cargo normalizado
      const normalized = normalizeCharge(mockShift4Charge);
      assert(mockChargesRepo.registerCharge.calledOnceWith(sinon.match(normalized)));

      // Verificamos que el resultado final incluye el ID de la base de datos
      assert.strictEqual(result.id, dbId);
      assert.strictEqual(result.chargeExternalId, mockShift4Charge.id);
    });

    it('debería lanzar un error pero registrar el cargo si la API falla con un chargeId', async () => {
      const chargeId = 'ch_failed_but_exists';
      const errorResponse: IShift4ErrorResponse = {
        error: {
          type: 'card_error',
          message: 'Card declined',
          chargeId: chargeId,
        },
      };
      const mockFailedCharge: IShift4Charge = {
        id: chargeId,
        status: 'failed',
        amount: 500,
        created: Date.now(),
        currency: 'USD',
        objectType: 'charge',
        type: 'customer_initiated',
        description: ''
      };

      // El primer fetch (POST /charges) falla
      fetchStub.withArgs(`${mockConfig.SHIFT4_URL}/charges`).resolves(new Response(JSON.stringify(errorResponse), { status: 402 }));
      // El segundo fetch (GET /charges/:id) tiene éxito
      fetchStub.withArgs(`${mockConfig.SHIFT4_URL}/charges/${chargeId}`).resolves(new Response(JSON.stringify(mockFailedCharge), { status: 200 }));
      
      mockChargesRepo.registerCharge.resolves(99);

      // Verificamos que el método lanza un error
      await assert.rejects(
        () => service.charge(paymentPayload),
        new Error(errorResponse.error.message)
      );

      // Verificamos que se intentó obtener el cargo fallido
      assert(fetchStub.calledWith(`${mockConfig.SHIFT4_URL}/charges/${chargeId}`));
      // Verificamos que, a pesar del error, se intentó registrar el cargo
      assert(mockChargesRepo.registerCharge.calledOnce);
    });

    it('debería lanzar un error y no registrar nada si la API falla sin un chargeId', async () => {
      const errorResponse: IShift4ErrorResponse = {
        error: {
          type: 'invalid_request',
          message: 'Invalid amount',
        },
      };

      fetchStub.resolves(new Response(JSON.stringify(errorResponse), { status: 400 }));

      await assert.rejects(
        () => service.charge(paymentPayload),
        new Error(errorResponse.error.message)
      );

      // Verificamos que el repositorio NUNCA fue llamado
      assert(mockChargesRepo.registerCharge.notCalled);
    });
  });

  describe('getCharge', () => {
    it('debería obtener y devolver un cargo por su ID', async () => {
      const chargeId = 'ch_xyz';
      const mockShift4Charge: IShift4Charge = { id: chargeId, status: 'successful' } as IShift4Charge;

      fetchStub.resolves(new Response(JSON.stringify(mockShift4Charge), { status: 200 }));

      const result = await service.getCharge(chargeId);

      assert(fetchStub.calledOnceWith(`${mockConfig.SHIFT4_URL}/charges/${chargeId}`));
      assert.deepStrictEqual(result, mockShift4Charge);
    });
  });
});
