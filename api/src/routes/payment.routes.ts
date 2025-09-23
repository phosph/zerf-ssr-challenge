import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { type ITipPyamentBody, tipPaymentSchema } from '../schemas/tip-payment-body.schema.ts';

export default fp(function paymentRoutesPlugin(appInstance) {
    appInstance.post("/tip/payment", { schema: { body: tipPaymentSchema } }, async (request: FastifyRequest<{
        Body: ITipPyamentBody
    }>) => {
        const payload = request.body
        console.debug(payload)

        return { success: false }
    });
})