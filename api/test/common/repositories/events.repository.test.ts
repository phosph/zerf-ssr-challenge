import { afterEach, beforeEach, describe, it } from 'mocha';
import { strict as assert } from 'node:assert';
import type { PoolClient } from 'pg';
import * as sinon from 'sinon';
import { ChargesRepository } from '../../../src/common/repositories/charges.repository.ts';
import { EventsRepository, type IShift4Event } from '../../../src/common/repositories/events.repository.ts';
import type { IShift4Charge } from '../../../src/common/Shift4Payment.service.ts';
import { normalizeCharge } from '../../../src/common/utils/normalizeCharge.ts';

describe('EventsRepository', () => {
    let mockDbClient: { query: sinon.SinonStub };
    let mockChargesRepo: sinon.SinonStubbedInstance<ChargesRepository>;
    let eventsRepository: EventsRepository;

    beforeEach(() => {
        mockDbClient = { query: sinon.stub() };
        mockChargesRepo = sinon.createStubInstance(ChargesRepository);
        eventsRepository = new EventsRepository(
            mockDbClient as unknown as PoolClient,
            mockChargesRepo
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('registerUnprocessedEvent', () => {
        it('debería devolver { alreadyRegistered: true } si el evento ya existe', async () => {
            // Simulamos que la consulta EXISTS devuelve que el evento existe
            mockDbClient.query.resolves({ rows: [{ exists: true }], rowCount: 1 });

            const result = await eventsRepository.registerUnprocessedEvent('evt_exists');

            assert.deepStrictEqual(result, { alreadyRegistered: true });
            // Verificamos que solo se llamó a la consulta SELECT y no a INSERT
            assert(mockDbClient.query.calledOnce);
            assert(mockDbClient.query.calledWith(sinon.match(/SELECT EXISTS/i), ['evt_exists']));
        });

        it('debería insertar un nuevo evento y devolver { alreadyRegistered: false } si no existe', async () => {
            // La primera llamada (SELECT) devuelve que no existe
            mockDbClient.query.onFirstCall().resolves({ rows: [{ exists: false }], rowCount: 1 });
            // La segunda llamada (INSERT) no necesita devolver nada
            mockDbClient.query.onSecondCall().resolves({ rows: [], rowCount: 1 });

            const result = await eventsRepository.registerUnprocessedEvent('evt_new');

            assert.deepStrictEqual(result, { alreadyRegistered: false });
            // Verificamos que se hicieron dos llamadas a la BD
            assert(mockDbClient.query.calledTwice);
            // Verificamos que la segunda llamada fue un INSERT con los datos correctos
            assert(mockDbClient.query.secondCall.calledWith(sinon.match(/INSERT INTO events/i), ['evt_new']));
        });
    });

    describe('updateUnprocessedEvent', () => {
        it('debería llamar a chargesRepository.upsertCharge si el tipo de evento es de cargo', async () => {
            const chargeData: IShift4Charge = { id: 'ch_123', amount: 100, status: 'successful', created: Date.now(), currency: 'USD' } as IShift4Charge;
            const event: IShift4Event = {
                id: 'evt_123',
                created: Date.now(),
                objectType: 'event',
                type: 'CHARGE_SUCCEEDED',
                data: chargeData,
            };
            const normalized = normalizeCharge(chargeData);

            // Simulamos la respuesta de la consulta UPDATE
            mockDbClient.query.resolves({ rows: [{ id: 1, event_external_id: 'evt_123' }], rowCount: 1 });

            await eventsRepository.updateUnprocessedEvent(event);

            // Verificamos que se llamó a upsertCharge con los datos correctos
            assert(mockChargesRepo.upsertCharge.calledOnceWith(normalized), 'upsertCharge no fue llamado con el cargo normalizado');

            // Verificamos que la consulta UPDATE se ejecutó
            assert(mockDbClient.query.calledOnceWith(sinon.match(/UPDATE events/i), [event.id, event.type, event.data]));
        });

        it('NO debería llamar a chargesRepository.upsertCharge si el tipo de evento no es de cargo', async () => {
            const event: IShift4Event = {
                id: 'evt_456',
                created: Date.now(),
                objectType: 'event',
                type: 'CUSTOMER_CREATED',
                data: { id: 'cust_123' },
            };
            mockDbClient.query.resolves({ rows: [{ id: 2 }], rowCount: 1 });

            await eventsRepository.updateUnprocessedEvent(event);

            assert(mockChargesRepo.upsertCharge.notCalled, 'upsertCharge fue llamado incorrectamente');
        });
    });

    describe('markAsSpam', () => {
        it('debería ejecutar una consulta UPDATE para marcar un evento como spam', async () => {
            mockDbClient.query.resolves({ rows: [], rowCount: 1 });
            await eventsRepository.markAsSpam('evt_spam');

            assert(mockDbClient.query.calledOnceWith(sinon.match(/is_span = TRUE/i), ['evt_spam']));
        });
    });
});
