import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import pgFastify from '@fastify/postgres';
import wsPlugin from '@fastify/websocket';
import fp from 'fastify-plugin';

import { webSocketManager, type WebSocketManager } from './common/WebSocketManager.ts';
import dashboardRoutes from './dashboard/dashboard.routes.ts';
import { EnvSchema, type Env } from './env.ts';
import paymentRoutes from './tip-payment/payment.routes.ts';


declare module 'fastify' {
    interface FastifyInstance {
        config: Env;
        wsManager: WebSocketManager;
    }
}

export default fp(async function appModule(appInstance) {
    await appInstance.register(fastifyEnv, { schema: EnvSchema, dotenv: true })
    appInstance.register(cors)

    appInstance.register(wsPlugin);
    appInstance.decorate('wsManager', webSocketManager);

    appInstance.register(pgFastify, {
        connectionString: appInstance.config.DATABASE_URL,
    })

    appInstance.register(paymentRoutes)
    appInstance.register(dashboardRoutes)
})
