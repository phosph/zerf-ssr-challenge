import type { PaymentResult } from "@/app/pay-with-card/Shift4Context";
import { Dialog, DialogContent } from "../../ui/dialog";
import { ErrorPaymentDialog } from "./error-payment-dialog";
import { SuccessPaymentDialog } from "./success-payment-dialog";

export function PaymentDialog({ paymentState }: { paymentState: PaymentResult | null }) {

    const isOpen = paymentState !== null

    return (
        <Dialog open={isOpen}>
            <DialogContent>
                {paymentState?.success ? <SuccessPaymentDialog /> : <ErrorPaymentDialog />}
            </DialogContent>
        </Dialog>
    )
}
