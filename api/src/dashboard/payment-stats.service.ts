import type { DashboardFilters, PaymentStats } from "common/dashboard/types";
import type { Pool } from "pg";
import { ChargesRepository, DefaultStatsCommonFilters } from "../common/repositories/charges.repository.ts";

export class PaymentStatsService {
    readonly #chargesRepository: ChargesRepository

    constructor(chargesRepository: ChargesRepository) {
        this.#chargesRepository = chargesRepository
    }

    static async getInitialStats(db: Pool): Promise<PaymentStats> {
        const client = await db.connect();
        try {
            const service = new PaymentStatsService(new ChargesRepository(client));
            return service.getStats();
        } finally {
            client.release();
        }
    }


    async getStats(filters: DashboardFilters = DefaultStatsCommonFilters()): Promise<PaymentStats> {
        const [stats, averageTipsSet, percentageByPaymentType] = await Promise.all([
            this.#chargesRepository.getSummarizedStats(filters),
            this.#chargesRepository.getAverageTipsSet(filters),
            this.#chargesRepository.getPercentageByPaymentType(filters),
        ])

        return {
            ...stats,
            ...averageTipsSet,
            ...percentageByPaymentType,
        }
    }
}
