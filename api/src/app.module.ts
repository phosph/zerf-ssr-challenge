import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import wsPlugin from '@fastify/websocket';
import fp from 'fastify-plugin';

import dbPlugin from './repositories/db-config.ts';
import paymentRoutes from './routes/payment.routes.ts';
import { EnvSchema, type Env } from './env.ts';


declare module 'fastify' {
    interface FastifyInstance {
        config: Env;
    }
}

export default fp(async function appModule(appInstance) {
    appInstance.register(wsPlugin)
    await appInstance.register(fastifyEnv, { schema: EnvSchema, dotenv: true })
    appInstance.register(dbPlugin)
    appInstance.register(cors)

    appInstance.register(paymentRoutes)
})