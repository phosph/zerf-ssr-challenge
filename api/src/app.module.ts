import fastifyEnv from '@fastify/env';
import wsPlugin from '@fastify/websocket';
import type { JSONSchemaType } from 'ajv';
import fp from 'fastify-plugin';
import cors from '@fastify/cors'

import dbPlugin from './repositories/db-config.ts'
import paymentRoutes from './routes/payment.routes.ts'

interface Env {
    PORT: number,
    DATABASE_URL: string
}


declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}

const EnvSchema: JSONSchemaType<Env> = {
    type: 'object',
    required: ['PORT', 'DATABASE_URL'],
    properties: {
        PORT: {
            type: 'number',
        },
        DATABASE_URL: {
            type: 'string',
        }
    }
}

export default fp(async function appModule(appInstance) {
    appInstance.register(wsPlugin)
    await appInstance.register(fastifyEnv, { schema: EnvSchema, dotenv: true })
    appInstance.register(dbPlugin)
    appInstance.register(cors)
    
    appInstance.register(paymentRoutes)
})