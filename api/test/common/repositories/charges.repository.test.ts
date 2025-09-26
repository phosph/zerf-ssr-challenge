import { describe, it, beforeEach, afterEach } from 'mocha';
import { strict as assert } from 'node:assert';
import * as sinon from 'sinon';
import type { PoolClient } from 'pg';
import { ChargesRepository, DefaultStatsCommonFilters } from '../../../src/common/repositories/charges.repository.ts';
import type { ICharge } from 'common/dashboard/types';

describe('ChargesRepository', () => {
    let mockDbClient: { query: sinon.SinonStub };
    let repository: ChargesRepository;

    beforeEach(() => {
        // Creamos un objeto mock con un stub para el método `query`
        mockDbClient = {
            query: sinon.stub(),
        };
        repository = new ChargesRepository(mockDbClient as unknown as PoolClient);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('registerCharge', () => {
        it('debería ejecutar una consulta INSERT y devolver el nuevo ID', async () => {
            const charge: ICharge = {
                chargeExternalId: 'ch_123',
                amount: 1500,
                status: 'successful',
                created: Date.now(),
                currency: 'USD',
            };
            const expectedId = 42;

            // Configuramos el stub para que devuelva el ID esperado
            mockDbClient.query.resolves({ rows: [{ id: expectedId }], rowCount: 1 });

            const resultId = await repository.registerCharge(charge);

            assert.strictEqual(resultId, expectedId, 'El ID devuelto no es el esperado');
            
            // Verificamos que `query` fue llamado con la sentencia SQL y los valores correctos
            assert(mockDbClient.query.calledOnce);
            const [queryText, values] = mockDbClient.query.firstCall.args;
            assert(queryText.includes('INSERT INTO charges'));
            assert.deepStrictEqual(values, [charge.chargeExternalId, charge.amount, charge.status, 'card']);
        });
    });

    describe('updateCharge', () => {
        it('debería ejecutar una consulta UPDATE y devolver el ID', async () => {
            const charge: ICharge = {
                chargeExternalId: 'ch_123',
                amount: 1500,
                status: 'failed',
                created: Date.now(),
                currency: 'USD',
            };
            const expectedId = 42;
            mockDbClient.query.resolves({ rows: [{ id: expectedId }], rowCount: 1 });

            const resultId = await repository.updateCharge(charge);

            assert.strictEqual(resultId, expectedId);
            assert(mockDbClient.query.calledOnce);
            const [queryText, values] = mockDbClient.query.firstCall.args;
            assert(queryText.replace(/\s+/gm, ' ').includes('UPDATE charges SET charge_external_id = $1, amount = $2, status = $3, payment_type = $4'));
            assert.deepStrictEqual(values, [charge.chargeExternalId, charge.amount, charge.status, "card"]);
        });
    });

    describe('chargeIsRegistered', () => {
        it('debería devolver true si el cargo existe', async () => {
            // La consulta `SELECT EXISTS` devuelve una fila con un booleano
            mockDbClient.query.resolves({ rows: [{ exists: true }], rowCount: 1 });
            
            const result = await repository.chargeIsRegistered('ch_exists');
            
            assert.strictEqual(result, true);
            assert(mockDbClient.query.calledOnceWith(sinon.match.string, ['ch_exists']));
        });

        it('debería devolver false si el cargo no existe', async () => {
            mockDbClient.query.resolves({ rows: [{ exists: false }], rowCount: 1 });
            
            const result = await repository.chargeIsRegistered('ch_not_exists');
            
            assert.strictEqual(result, false);
        });
    });

    describe('upsertCharge', () => {
        it('debería llamar a updateCharge si el cargo ya existe', async () => {
            const charge: ICharge = { chargeExternalId: 'ch_ext_1', amount: 100, status: 'successful', created: 0, currency: 'USD' };
            
            // Creamos stubs para los métodos que queremos espiar/controlar
            const chargeIsRegisteredStub = sinon.stub(repository, 'chargeIsRegistered').resolves(true);
            const updateChargeStub = sinon.stub(repository, 'updateCharge').resolves(1);
            const registerChargeStub = sinon.stub(repository, 'registerCharge').resolves(1);

            await repository.upsertCharge(charge);

            assert(chargeIsRegisteredStub.calledOnceWith(charge.chargeExternalId));
            assert(updateChargeStub.calledOnceWith(charge), 'updateCharge debería haber sido llamado');
            assert(registerChargeStub.notCalled, 'registerCharge no debería haber sido llamado');
        });

        it('debería llamar a registerCharge si el cargo no existe', async () => {
            const charge: ICharge = { chargeExternalId: 'ch_ext_1', amount: 100, status: 'successful', created: 0, currency: 'USD' };
            
            const chargeIsRegisteredStub = sinon.stub(repository, 'chargeIsRegistered').resolves(false);
            const updateChargeStub = sinon.stub(repository, 'updateCharge').resolves(1);
            const registerChargeStub = sinon.stub(repository, 'registerCharge').resolves(1);

            await repository.upsertCharge(charge);

            assert(chargeIsRegisteredStub.calledOnceWith(charge.chargeExternalId));
            assert(updateChargeStub.notCalled, 'updateCharge no debería haber sido llamado');
            assert(registerChargeStub.calledOnceWith(charge), 'registerCharge debería haber sido llamado');
        });
    });

    describe('getSummarizedStats', () => {
        it('debería construir la consulta SQL correcta con los filtros proporcionados', async () => {
            const mockStats = { totalTips: 5000, averageTips: 500, transactionAmount: 10 };
            mockDbClient.query.resolves({ rows: [mockStats], rowCount: 1 });

            const filters = DefaultStatsCommonFilters();
            const stats = await repository.getSummarizedStats(filters);

            assert.deepStrictEqual(stats, mockStats);

            assert(mockDbClient.query.calledOnce);
            const [queryText, values] = mockDbClient.query.firstCall.args;
            assert(queryText.includes('WHERE created_at >= $1 AND created_at <= $2 AND status IN ($3)'));
            assert.deepStrictEqual(values, [filters.startDate, filters.endDate, ...filters.status!]);
        });

        // it('debería usar filtros por defecto si no se proporcionan', async () => {
        //     const mockStats = { totalTips: 100, averageTips: 10, transactionAmount: 1 };
        //     mockDbClient.query.resolves({ rows: [mockStats], rowCount: 1 });

        //     await repository.getSummarizedStats(); // Sin filtros

        //     const defaultFilters = DefaultStatsCommonFilters();
        //     assert(mockDbClient.query.calledOnce);
        //     const [queryText, values] = mockDbClient.query.firstCall.args;
        //     assert(queryText.includes('WHERE created_at >= $1 AND created_at <= $2 AND status IN ($3)'));
        //     assert.deepStrictEqual(values, [defaultFilters.startDate, defaultFilters.endDate, ...defaultFilters.status!]);
        // });
    });

    describe('getAverageTipsSet', () => {
        it('debería devolver un conjunto de datos de propinas promedio', async () => {
            const mockDbResponse = [
                { day: '2024-01-01T00:00:00.000Z', averageTips: 15050 },
                { day: '2024-01-02T00:00:00.000Z', averageTips: 0 }, // Día sin propinas
            ];
            mockDbClient.query.resolves({ rows: mockDbResponse, rowCount: 2 });

            const filters = DefaultStatsCommonFilters();
            const result = await repository.getAverageTipsSet(filters);

            assert.strictEqual(result.averageTipsSet.list.length, 2);
            assert.strictEqual(result.averageTipsSet.list[0].averageTips, 15050);
            assert.strictEqual(result.averageTipsSet.list[1].averageTips, 0); // null se convierte en 0
            assert(mockDbClient.query.calledOnce);
        });
    });

    describe('getPercentageByPaymentType', () => {
        it('debería devolver el porcentaje de propinas por tipo de pago', async () => {
            const mockDbResponse = [
                { paymentType: 'card', percentage: 60.00 },
                { paymentType: 'cash', percentage: 40.00 },
            ];
            mockDbClient.query.resolves({ rows: mockDbResponse, rowCount: 2 });

            const filters = DefaultStatsCommonFilters();
            const result = await repository.getPercentageByPaymentType(filters);

            const expected = {
                tipsPercentageByPaymentType: [
                    { paymentType: 'card', percentage: 60.00 },
                    { paymentType: 'cash', percentage: 40.00 },
                ]};
            assert.deepStrictEqual(result, expected);
            assert(mockDbClient.query.calledOnce);
        });
    });
});
