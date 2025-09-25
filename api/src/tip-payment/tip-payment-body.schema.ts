import type { JSONSchemaType } from "ajv";
import { MIN_CURRENCY_AMOUNT } from "common/currency-utils.js";
import type { ITipPaymentBody } from 'common/dashboard/types'

export { type ITipPaymentBody }

export const tipPaymentSchema: JSONSchemaType<ITipPaymentBody> = {
    type: "object",
    required: [ "tokenId", "country", "amount"],
    properties: {
        "tokenId": {
            type: "string"
        },
        "country": {
            type: "string"
        },
        "amount": {
            type: "integer",
            minimum: MIN_CURRENCY_AMOUNT
        }
    }
}
