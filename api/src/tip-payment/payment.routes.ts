import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { Env } from '../env.ts';
import { type ITipPyamentBody, tipPaymentSchema } from './tip-payment-body.schema.ts';
import { Shift4PaymentService } from '../common/Shift4Payment.service.ts';
import { CheckoutRepository } from '../common/repositories/Checkouts.repository..ts';

export default fp(function paymentRoutesPlugin(appInstance) {
    appInstance.post(
        "/tip/payment",
        { schema: { body: tipPaymentSchema } },
        async (request: FastifyRequest<{ Body: ITipPyamentBody, }>, reply) => {

            const client = await appInstance.pg!.connect()

            try {
                const paymentService = new Shift4PaymentService(
                    request.getEnvs<Env>(),
                    new CheckoutRepository(client)
                )
    
                return paymentService.charge(request.body)
            } catch (error) {
                request.log.error(error, 'Failed to process payment');
                return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not process the payment.' })
            } finally {
                // Ensure the database client is always released
                client.release()
            }
        }
    );
})