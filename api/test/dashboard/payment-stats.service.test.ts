import { describe, it, beforeEach, afterEach } from 'mocha';
import { strict as assert } from 'node:assert';
import * as sinon from 'sinon';
import type { Pool } from 'pg';
import { ChargesRepository, DefaultStatsCommonFilters } from '../../src/common/repositories/charges.repository.ts';
import { PaymentStatsService } from '../../src/dashboard/payment-stats.service.ts';
import type { AverageTipsSet, DashboardFilters, SummarizedTipsStats, TipsPercentageByPaymentType } from 'common/dashboard/types';

describe('PaymentStatsService', () => {
  let mockChargesRepo: sinon.SinonStubbedInstance<ChargesRepository>;
  let service: PaymentStatsService;

  beforeEach(() => {
    // Creamos un stub completo de ChargesRepository
    mockChargesRepo = sinon.createStubInstance(ChargesRepository);
    service = new PaymentStatsService(mockChargesRepo);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getStats', () => {
    it('debería llamar a todos los métodos del repositorio y combinar sus resultados', async () => {
      // 1. Preparación: Datos simulados que devolverá el repositorio
      const mockStats: SummarizedTipsStats = { totalTips: 1000, averageTips: 100, transactionAmount: 10 };
      const mockAverageSet: AverageTipsSet = { averageTipsSet: { list: [], dateRange: { startDate: '', endDate: '' } } };
      const mockPercentage: TipsPercentageByPaymentType = { tipsPercentageByPaymentType: [] };

      // Configuramos los stubs para que devuelvan los datos simulados
      mockChargesRepo.getSummarizedStats.resolves(mockStats);
      mockChargesRepo.getAverageTipsSet.resolves(mockAverageSet);
      mockChargesRepo.getPercentageByPaymentType.resolves(mockPercentage);

      // 2. Ejecución: Llamamos al método que queremos probar
      const result = await service.getStats();

      // 3. Aserción: Verificamos el resultado
      // El resultado debe ser la combinación de los objetos simulados
      const expectedResult = {
        ...mockStats,
        ...mockAverageSet,
        ...mockPercentage,
      };
      assert.deepStrictEqual(result, expectedResult, 'El resultado no es la combinación esperada');

      // Verificamos que los métodos del repositorio fueron llamados
      assert(mockChargesRepo.getSummarizedStats.calledOnce, 'getSummarizedStats no fue llamado');
      assert(mockChargesRepo.getAverageTipsSet.calledOnce, 'getAverageTipsSet no fue llamado');
      assert(mockChargesRepo.getPercentageByPaymentType.calledOnce, 'getPercentageByPaymentType no fue llamado');
    });

    it('debería pasar los filtros correctos al repositorio', async () => {
      const customFilters: DashboardFilters = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        status: ['successful'],
      };

      // No necesitamos configurar el valor de retorno, solo verificar la llamada
      mockChargesRepo.getSummarizedStats.resolves({} as any);
      mockChargesRepo.getAverageTipsSet.resolves({} as any);
      mockChargesRepo.getPercentageByPaymentType.resolves({} as any);

      await service.getStats(customFilters);

      // Verificamos que los métodos fueron llamados con los filtros personalizados
      assert(mockChargesRepo.getSummarizedStats.calledOnceWith(customFilters));
      assert(mockChargesRepo.getAverageTipsSet.calledOnceWith(customFilters));
      assert(mockChargesRepo.getPercentageByPaymentType.calledOnceWith(customFilters));
    });

    it('debería usar filtros por defecto si no se proporcionan', async () => {
      mockChargesRepo.getSummarizedStats.resolves({} as any);
      mockChargesRepo.getAverageTipsSet.resolves({} as any);
      mockChargesRepo.getPercentageByPaymentType.resolves({} as any);

      await service.getStats(); // Sin argumentos

      const defaultFilters = DefaultStatsCommonFilters();
      // Verificamos que los métodos fueron llamados con los filtros por defecto
      assert(mockChargesRepo.getSummarizedStats.calledOnceWith(defaultFilters));
    });
  });

  describe('getInitialStats (static)', () => {
    it('debería obtener un cliente, llamar a getStats y liberar el cliente', async () => {
      // 1. Preparación: Simulamos el pool de la base de datos y su cliente
      const mockClient = { release: sinon.stub() };
      const mockDbPool = { connect: sinon.stub().resolves(mockClient) };

      // Reemplazamos temporalmente el método `getStats` de la instancia para aislar la prueba
      const getStatsStub = sinon.stub(PaymentStatsService.prototype, 'getStats').resolves({} as any);

      // 2. Ejecución
      await PaymentStatsService.getInitialStats(mockDbPool as unknown as Pool);

      // 3. Aserción
      assert(mockDbPool.connect.calledOnce, 'db.connect() no fue llamado');
      assert(getStatsStub.calledOnce, 'service.getStats() no fue llamado');
      assert(mockClient.release.calledOnce, 'client.release() no fue llamado');
    });
  });
});
