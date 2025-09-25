import type { Env } from "../env.ts";
import type { EventsRepository, IShift4Event } from "./repositories/events.repository.ts";

export class Shift4EventsService {
    readonly #baseUrl: string
    readonly #privateKey: string
    readonly #eventsRepository: EventsRepository

    get #authHeader() {
        return `Basic ${Buffer.from(`${this.#privateKey}:`).toString("base64")}`
    }

    constructor(config: Env, eventsRepository: EventsRepository) {
        ({
            SHIFT4_URL: this.#baseUrl,
            SHIFT4_PRIVATE_KEY: this.#privateKey,
        } = config);

        this.#eventsRepository = eventsRepository
    }


    async * onEventNotification(eventId: string) {
        let alreadyRegistered = false
        
        yield this.#eventsRepository.registerUnprocessedEvent(eventId)
            .then(({ alreadyRegistered: _alreadyRegistered }) => {
                alreadyRegistered = _alreadyRegistered
            })

        if (alreadyRegistered) {
            return; // nothing to do
        }


        const resource = await this.fetchEvent(eventId)

        await this.#eventsRepository.updateUnprocessedEvent(resource);
    }


    async fetchEvent(eventId: string): Promise<IShift4Event> {
        const response = await fetch(`${this.#baseUrl}/events/${eventId}`, {
            method: 'GET',
            headers: { Authorization: this.#authHeader }
        })

        if (!response.ok) {
            if (response.status === 404) {
                await this.#eventsRepository.markAsSpam(eventId)
            }

            throw await response.json()
        } else {
            return response.json() as Promise<IShift4Event>
        }
    }

}
