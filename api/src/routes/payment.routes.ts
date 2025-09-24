import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { Env } from '../env.ts';
import { type ITipPyamentBody, tipPaymentSchema } from '../schemas/tip-payment-body.schema.ts';
import { Shift4PaymentService } from '../services/Shift4Payment.service.ts';

export default fp(function paymentRoutesPlugin(appInstance) {
    appInstance.post(
        "/tip/payment",
        { schema: { body: tipPaymentSchema } },
        async (request: FastifyRequest<{ Body: ITipPyamentBody, }>) => {
            const paymentService = new Shift4PaymentService(request.getEnvs<Env>())

            await paymentService.charge(request.body)

            return { success: false }
        }
    );
})