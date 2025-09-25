import fastifySchedule from '@fastify/schedule';
import type { DashboardFilters } from 'common/dashboard/types';
import fp from 'fastify-plugin';
import { createDashboardUpdateCronTask } from './dashboardUpdateCronTask.ts';
import { PaymentStatsService } from './payment-stats.service.ts';

export default fp(function dashboardRoutesPlugin(appInstance) {
    appInstance.register(fastifySchedule);

    appInstance.ready().then(() => {
        appInstance.scheduler.addSimpleIntervalJob(createDashboardUpdateCronTask(appInstance.pg, appInstance.wsManager))
    })

    appInstance.get("/dashboard/ws", { websocket: true }, async (socket, req) => {
        appInstance.wsManager.addClient(socket);

        req.log.info('WebSocket client connected');

        // Send initial stats on connection
        const initialStats = await PaymentStatsService.getInitialStats(appInstance.pg.pool);
        socket.send(JSON.stringify(initialStats));
        
        socket.on('close', () => {
            appInstance.wsManager.removeClient(socket);
            req.log.info('WebSocket client disconnected');
        });

        socket.on('message', (message) => {
            try {
                // TODO: validate
                const filters: DashboardFilters = JSON.parse(message.toString());

                req.log.info({ filters }, 'Received filters from client');

                appInstance.wsManager.updateClientFilters(socket, filters);
            } catch (error) {
                req.log.error(error, 'Failed to parse message from client');
            }
        });
    })

})
