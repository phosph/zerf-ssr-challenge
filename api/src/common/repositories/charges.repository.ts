import type { AverageTipsSet, AverageTipsSetFilters, CommonTipsStatsFilters, DashboardFilters, ICharge, SummarizedTipsStats, TipsPercentageByPaymentType } from "common/dashboard/types";
import type { Pool, PoolClient } from "pg";


export class ChargesRepository {
    readonly #db: Pool | PoolClient

    constructor(pg: Pool | PoolClient) {
        this.#db = pg
    }


    async registerCharge(charge: ICharge): Promise<number> {
        const { rows: [{ id }] } = await this.#db.query<{ id: number }>(`
            INSERT INTO charges (charge_external_id, amount, status, payment_type)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [charge.chargeExternalId, charge.amount, charge.status, "card"])

        return id;
    }
    async updateCharge(charge: ICharge): Promise<number> {
        const { rows: [{ id }] } = await this.#db.query<{ id: number }>(`
            UPDATE charges
            SET
                charge_external_id = $1,
                amount = $2,
                status = $3,
                payment_type = $4
            RETURNING id
        `, [charge.chargeExternalId, charge.amount, charge.status, "card"])

        return id;
    }

    async upsertCharge(charge: ICharge): Promise<number> {
        if (await this.chargeIsRegistered(charge.chargeExternalId)) {
            return this.updateCharge(charge)
        } else {
            return this.registerCharge(charge)
        }
    }

    async chargeIsRegistered(externalChargeId: string): Promise<boolean> {
        const { rows: [{ exists }] } = await this.#db.query<{ exists: boolean }>(`
            SELECT EXISTS(SELECT 1 FROM charges WHERE charge_external_id = $1)
        `, [externalChargeId])

        return exists
    }

    async getSummarizedStats(filters: DashboardFilters): Promise<SummarizedTipsStats> {
        const {
            queryParams,
            whereClauses
        } = this._parse_common_statsd_filters(filters)

        const { rows: [stats] } = await this.#db.query<SummarizedTipsStats>(
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


    async getAverageTipsSet(filters: AverageTipsSetFilters): Promise<AverageTipsSet> {
        const {
            queryParams,
            whereClauses
        } = this._parse_common_statsd_filters(filters)

        const { rows } = await this.#db.query<{ day: Date, averageTips: number }>(
            `
                SELECT 
                    date_trunc('day', created_at) AS "day",
                    AVG(amount)::INTEGER AS "averageTips"
                FROM charges
                WHERE ${whereClauses.join(' AND ')}
                GROUP BY "day"
                ORDER BY "day"
            `,
            queryParams
        );

        return {
            averageTipsSet: {
                list: rows,
                dateRange: {
                    startDate: filters.startDate,
                    endDate: filters.endDate ?? new Date().toISOString(),
                }
            }
        };
    }

    async getPercentageByPaymentType(filters: CommonTipsStatsFilters): Promise<TipsPercentageByPaymentType> {
        const {
            queryParams,
            whereClauses
        } = this._parse_common_statsd_filters(filters)

        const { rows } = await this.#db.query<{ paymentType: string, percentage: number }>(
            `
                SELECT 
                    payment_type as "paymentType",
                    (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ())::REAL AS "percentage"
                FROM charges
                WHERE ${whereClauses.join(' AND ')}
                GROUP BY "paymentType"
                ORDER BY "paymentType"
            `,
            queryParams
        );

        return { tipsPercentageByPaymentType: rows };
    }


    protected _parse_common_statsd_filters(filters?: CommonTipsStatsFilters) {
        const queryParams: unknown[] = [];
        const whereClauses = [];

        if (filters?.startDate) {
            queryParams.push(filters.startDate);
            whereClauses.push(`created_at >= $${queryParams.length}`);
        }

        if (filters?.endDate) {
            queryParams.push(filters.endDate);
            whereClauses.push(`created_at <= $${queryParams.length}`);
        }

        if (filters?.status?.length) {
            queryParams.push(...filters.status);
            whereClauses.push(`status IN (${filters.status.map(() => `$${queryParams.length}`).join(', ')})`);
        } else {
            whereClauses.push("status = 'successful'");
        }

        return {
            queryParams,
            whereClauses
        }
    }
}
