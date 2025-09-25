import type { Env } from "../env";
import type { ITipPyamentBody } from "../tip-payment/tip-payment-body.schema";
import type { CheckoutRepository } from "./repositories/Checkouts.repository.";

export interface IShift4Charge {
    id: string;
    created: number; // timestamp
    objectType: "charge"
    /** Charge amount in minor units of a given currency.For example 10€ is represented as "1000" and 10¥ is represented as "10". */
    amount: number; // integer
    /** The charge currency represented as a three - letter ISO currency code. */
    currency: string;
    type: string;
    description: string;
    status: "successful" | "pending" | "failed"
}

export interface ICharge {
    id?: string;
    chargeExternalId: string
    created: number; // timestamp
    amount: number; // integer
    currency: string;
    status: "successful" | "pending" | "failed"
}

export class Shift4PaymentService {
    readonly #baseUrl: string
    readonly #privateKey: string
    readonly repository: CheckoutRepository


    constructor(config: Env, repository: CheckoutRepository) {
        ({
            SHIFT4_URL: this.#baseUrl,
            SHIFT4_PRIVATE_KEY: this.#privateKey,
        } = config);

        this.repository = repository
    }


    async charge(payload: ITipPyamentBody): Promise<ICharge> {

        const chargeRequesPayload = {
            amount: payload.amount,
            currency: 'USD',
            type: 'customer_initiated',
            card: payload.tokenId
        }

        const resp = await fetch(`${this.#baseUrl}/charges`, {
            method: 'POST',
            body: JSON.stringify(chargeRequesPayload),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${this.#privateKey}:`).toString("base64")}`
            }
        });

        if (!resp.ok) {
            // If the response is not successful, throw an error to be caught by the route handler
            const errorBody = await resp.json() as any;
            // TODO get chargeId from error response
            console.debug(errorBody)
            throw new Error(errorBody.error?.message || 'Shift4 API request failed');
        }

        const shift4Charge = await resp.json() as IShift4Charge
        console.debug(shift4Charge)
        const charge: ICharge = this._normaliceCharge(shift4Charge)
        
        charge.id = await this.repository.registerCharge(charge)

        console.debug(charge)
        
        return charge
    }


    private _normaliceCharge(charge: IShift4Charge): ICharge {
        return {
            chargeExternalId: charge.id,
            created: charge.created,
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status
        }
    }
}