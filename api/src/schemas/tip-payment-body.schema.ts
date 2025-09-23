import type { JSONSchemaType } from "ajv";

export interface ITipPyamentBody {
    tokenId: string;
    country: string;
    amount: number;
}


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
            type: "integer"
        }
    }
}