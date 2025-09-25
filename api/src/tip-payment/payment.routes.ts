import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { Env } from '../env.ts';
import { type ITipPaymentBody, tipPaymentSchema } from './tip-payment-body.schema.ts';
import { Shift4PaymentService } from '../common/Shift4Payment.service.ts';
import { ChargesRepository } from '../common/repositories/charges.repository.ts';
import { request } from 'http';
import { Shift4EventsService } from '../common/Shift4Events.service.ts';
import { EventsRepository } from '../common/repositories/events.repository.ts';

export default fp(function paymentRoutesPlugin(appInstance) {
    appInstance.post(
        "/tip/payment",
        { schema: { body: tipPaymentSchema } },
        async (request: FastifyRequest<{ Body: ITipPaymentBody }>, reply) => {

            const client = await appInstance.pg!.connect()

            try {
                const paymentService = new Shift4PaymentService(
                    request.getEnvs<Env>(),
                    new ChargesRepository(client)
                )

                return await paymentService.charge(request.body)
            } catch (error) {
                request.log.error(error, 'Failed to process payment');
                return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not process the payment.' })
            } finally {
                client.release()
            }
        }
    );

    appInstance.post(
        "/tip/payment-wh",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["id"],
                    properties: {
                        id: { type: "string" }
                    }
                }
            }
        },
        async (request: FastifyRequest<{ Body: { id: string } }>, response) => {
            const { id } = request.body
            const client = await appInstance.pg!.connect()
            try {
                const eventService = new Shift4EventsService(
                    request.getEnvs<Env>(),
                    new EventsRepository(client, new ChargesRepository(client))
                )

                const steps = eventService.onEventNotification(id);

                await steps.next()

                await Promise.all([
                    response.status(200).send(), // as accepted 
                    steps.next() // process event
                ]);
            } finally {
                client.release()
            }

        }
    )
})
