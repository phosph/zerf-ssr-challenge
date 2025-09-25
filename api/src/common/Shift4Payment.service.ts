import type { ICharge } from "common/dashboard/types";
import type { Env } from "../env.ts";
import type { ITipPaymentBody } from "../tip-payment/tip-payment-body.schema.ts";
import type { ChargesRepository } from "./repositories/charges.repository.ts";
import { normalizeCharge } from "./utils/normalizeCharge.ts";

export interface IShift4ErrorResponse {
    error: {
        type:
        | "invalid_request"
        | "card_error"
        | "gateway_error"
        | "rate_limit_error";
        code?: string;
        message: string;
        chargeId?: string;
    }
}


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

export class Shift4PaymentService {
    readonly #baseUrl: string
    readonly #privateKey: string
    readonly repository: ChargesRepository


    constructor(config: Env, repository: ChargesRepository) {
        ({
            SHIFT4_URL: this.#baseUrl,
            SHIFT4_PRIVATE_KEY: this.#privateKey,
        } = config);

        this.repository = repository
    }

    get #authHeader() {
        return `Basic ${Buffer.from(`${this.#privateKey}:`).toString("base64")}`
    }


    async charge(payload: ITipPaymentBody): Promise<ICharge> {

        const chargeRequestPayload = {
            amount: payload.amount,
            currency: 'USD',
            type: 'customer_initiated',
            card: payload.tokenId
        }

        const resp = await fetch(`${this.#baseUrl}/charges`, {
            method: 'POST',
            body: JSON.stringify(chargeRequestPayload),
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.#authHeader
            }
        });

        if (!resp.ok) {
            // If the response is not successful, throw an error to be caught by the route handler
            const errorBody = await resp.json() as IShift4ErrorResponse;

            if (errorBody.error.chargeId) {
                const shift4Charge = await this.getCharge(errorBody.error.chargeId)
                await this.registerCharge(shift4Charge)
            }

            console.debug(errorBody)
            throw new Error(errorBody.error?.message || 'Shift4 API request failed');
        }

        const shift4Charge = await resp.json() as IShift4Charge

        const charge: ICharge = await this.registerCharge(shift4Charge)
        
        console.debug(charge)

        return charge
    }

    async getCharge(shift4ChargeId: string): Promise<IShift4Charge> {
        const resp = await fetch(`${this.#baseUrl}/charges/${shift4ChargeId}`, {
            method: 'GET',
            headers: { Authorization: this.#authHeader }
        })

        if (!resp.ok) {
            throw await resp.json() as IShift4ErrorResponse
        }

        return resp.json() as Promise<IShift4Charge>
    }

    protected async registerCharge(shift4Charge: IShift4Charge): Promise<ICharge> {
        const charge: ICharge = normalizeCharge(shift4Charge)

        charge.id = await this.repository.registerCharge(charge)

        return charge;
    }


}
