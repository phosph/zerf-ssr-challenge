import type { ICharge } from "common/dashboard/types";
import type { IShift4Charge } from "../Shift4Payment.service.ts";

export function normalizeCharge(charge: IShift4Charge): ICharge {
    return {
        chargeExternalId: charge.id,
        created: charge.created,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status
    }
}
