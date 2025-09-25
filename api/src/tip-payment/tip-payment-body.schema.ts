import type { JSONSchemaType } from "ajv";
import { MIN_CURRENCY_AMOUNT } from "common/currency-utils.js";
import type { ITipPyamentBody } from 'common/dashboard/types'

export { type ITipPyamentBody }

export const tipPaymentSchema: JSONSchemaType<ITipPyamentBody> = {
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
