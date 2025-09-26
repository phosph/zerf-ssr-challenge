import type { Pool, PoolClient } from "pg"
import type { ChargesRepository } from "./charges.repository.ts"
import { normalizeCharge } from "../utils/normalizeCharge.ts"

export interface IShift4Event {
    id: string,
    created: number,
    objectType: "event",
    type: string,
    data: Record<string, any>
}

export interface ChargeEvent {
    id: number
    eventExternalId: string
    isSpan: boolean
    createdAt: Date;
    updatedAt: Date;
}

export class EventsRepository {
    readonly #db: Pool | PoolClient
    readonly #chargesRepository: ChargesRepository

    constructor(pg: Pool | PoolClient, chargesRepository: ChargesRepository) {
        this.#db = pg
        this.#chargesRepository = chargesRepository
    }

    async registerUnprocessedEvent(eventExternalId: string): Promise<{
        alreadyRegistered: boolean
    }> {
        const { rows: [{ exists }] } = await this.#db.query<{ exists: boolean }>(`
            SELECT EXISTS(SELECT 1 FROM events WHERE event_external_id = $1)
        `, [eventExternalId])

        if (exists)
            return { alreadyRegistered: true }

        await this.#db.query(`
            INSERT INTO events (event_external_id)
            VALUES ($1)
        `, [eventExternalId])

        return { alreadyRegistered: false }
    }

    async updateUnprocessedEvent(resource: IShift4Event): Promise<ChargeEvent> {
        if (resource.type.startsWith("CHARGE_")) {
            await this.#chargesRepository.upsertCharge(
                normalizeCharge(resource.data as any)
            )
        }

        const { rows: [event] } = await this.#db.query<ChargeEvent>(`
            UPDATE events
            SET
                event_type = $2,
                payload = $3
            WHERE event_external_id = $1
            RETURNING *
        `, [resource.id, resource.type, resource.data])

        return event
    }

    async markAsSpam(eventExternalId: string): Promise<void> {
        await this.#db.query(`
            UPDATE events
            SET is_span = TRUE
            WHERE event_external_id = $1
        `, [eventExternalId])
    }

}
