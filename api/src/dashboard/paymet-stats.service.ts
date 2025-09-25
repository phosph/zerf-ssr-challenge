import type { Pool, PoolClient } from "pg";

export interface PaymentStats {
    totalTips: number;
    transactionAmount: number
    averageTips: number;
}

export interface DashboardFilters {
    startDate?: string;
    endDate?: string;
}


export class PaymentStatsService {
    readonly #db: Pool | PoolClient

    constructor(db: Pool | PoolClient) {
        this.#db = db
    }

    static async getInitialStats(db: Pool): Promise<PaymentStats> {
        const client = await db.connect();
        try {
            const service = new PaymentStatsService(client);
            return service.getStats();
        } finally {
            client.release();
        }
    }


    async getStats(filters?: DashboardFilters): Promise<PaymentStats> {
        const queryParams: unknown[] = [];
        const whereClauses = ["status = 'successful'"];

        if (filters?.startDate) {
            queryParams.push(filters.startDate);
            whereClauses.push(`created_at >= $${queryParams.length}`);
        }

        if (filters?.endDate) {
            queryParams.push(filters.endDate);
            whereClauses.push(`created_at <= $${queryParams.length}`);
        }

        const { rows: [stats] } = await this.#db.query<PaymentStats>(
            `
                SELECT 
                    COALESCE(SUM(amount), 0)::INTEGER AS "totalTips",
                    COALESCE(AVG(amount), 0)::INTEGER AS "averageTips",
                    COUNT(*)::INTEGER AS "transactionAmount"
                FROM charges
                WHERE ${whereClauses.join(' AND ')}
            `,
            queryParams
        );

        return stats;
    }
}