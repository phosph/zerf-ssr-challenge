import type { FastifyInstance } from "fastify"
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler"
import { PaymentStatsService } from "./payment-stats.service.ts"
import type { WebSocketManager } from "../common/WebSocketManager.ts"
import { ChargesRepository } from "../common/repositories/charges.repository.ts"

export function createDashboardUpdateCronTask(db: FastifyInstance['pg'], socketManager: WebSocketManager) {

    const task = new AsyncTask(
        'simple task',
        async () => {
            if (!socketManager.hasClients) return;

            const client = await db.connect()
            try {
                const statsService = new PaymentStatsService(new ChargesRepository(client));

                const generalStats = await statsService.getStats();
                const generalStatsPayload = JSON.stringify(generalStats);

                for (const [socket, state] of socketManager.allClients) {
                    if (state.filters && Object.keys(state.filters).length > 0) {
                        const filteredStats = await statsService.getStats(state.filters);
                        socket.send(JSON.stringify(filteredStats));
                    } else {
                        socket.send(generalStatsPayload);
                    }
                }
            } finally {
                client.release()
            }
        },
        (err) => {
            /* handle errors here */
            console.error(err)
        }
    )
    
    const job = new SimpleIntervalJob({ seconds: 10 }, task)

    return job
}
