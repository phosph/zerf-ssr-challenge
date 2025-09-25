'use client'

import CardForm from "@/components/payment/CardForm";
import PaymentButtons from "@/components/payment/PaymentButtons";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useShift4Form } from "./Shift4Context";
import { useRouter } from 'next/navigation'
import { currencyFromNaturalNumber, serialize } from "common/currency-utils.js";
import { PaymentDialog } from "@/components/payment/dialogs/payment-result-dialog";

export default function PayWithCard() {
    const totalAmount: number = currencyFromNaturalNumber(30); // TODO
    const { shift4Obj, cardFormRef, formRef, onSubmit, loading, paymentResult } = useShift4Form()
    const router = useRouter()

    return (
        <>
            <div className="pt-6 px-2">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
            </div>
            <form ref={formRef} onSubmit={onSubmit}>
                <div className="px-5 py-6">
                    <div className="text-[#2376A2] flex gap-3 items-center mb-6" role="presentational">
                        <Image src="/assets/icons/card.svg" width={24} height={20} alt="card" />
                        <h2 className="font-medium text-base">Card</h2>
                    </div>
                    {shift4Obj ? <CardForm shift4Obj={shift4Obj} ref={cardFormRef} /> : null}
                    <input type="hidden" name="amount" value={serialize(totalAmount)} />
                </div>
                <PaymentButtons
                    amount={totalAmount}
                    onPayWithCard={() => formRef.current?.requestSubmit()}
                    loading={loading}
                />
                <PaymentDialog paymentState={paymentResult} />
            </form>
        </>
    )
}
