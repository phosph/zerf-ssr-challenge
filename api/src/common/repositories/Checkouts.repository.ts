import type { PoolClient } from "pg";
import type { ICharge } from "common/dashboard/types";

export class CheckoutRepository {
    readonly #pg: PoolClient

    constructor(pg: PoolClient) {
        this.#pg = pg
    }


    async registerCharge(charge: ICharge): Promise<string> {
        const { rows: [{ id }] } = await this.#pg.query<{ id: string }>(`
            INSERT INTO charges (charge_external_id, amount, status)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [charge.chargeExternalId, charge.amount, charge.status])

        return id;
    }

    

}
