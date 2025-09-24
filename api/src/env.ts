import type { JSONSchemaType } from "ajv";

export interface Env {
    PORT: number;
    DATABASE_URL: string;
    SHIFT4_URL: string;
    SHIFT4_PRIVATE_KEY: string;
}



export const EnvSchema: JSONSchemaType<Env> = {
    type: 'object',
    required: ['PORT', 'DATABASE_URL', "SHIFT4_URL", "SHIFT4_PRIVATE_KEY"],
    properties: {
        PORT: {
            type: 'number',
        },
        DATABASE_URL: {
            type: 'string',
        },
        SHIFT4_URL: {
            type: 'string',
        },
        SHIFT4_PRIVATE_KEY: {
            type: 'string',
        }
    }
}