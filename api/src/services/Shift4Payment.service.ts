import type { Env } from "../env";
import type { ITipPyamentBody } from "../schemas/tip-payment-body.schema";

export class Shift4PaymentService {
    readonly #baseUrl: string
    readonly #privateKey: string

    constructor(config: Env) {
        ({
            SHIFT4_URL: this.#baseUrl,
            SHIFT4_PRIVATE_KEY: this.#privateKey,
        } = config);
    }


    async charge(payload: ITipPyamentBody) {

        const chargeRequesPayload = {
            amount: payload.amount,
            currency: 'USD',
            type: 'customer_initiated',
            card: payload.tokenId
        }

        const charge = await fetch(`${this.#baseUrl}/charges`, {
            method: 'POST',
            body: JSON.stringify(chargeRequesPayload),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${this.#privateKey}:`).toString("base64")}`
            }
        });

        console.debug(charge)

        return charge
    }
}