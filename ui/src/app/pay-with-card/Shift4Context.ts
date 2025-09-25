import type { ICarfFormRef } from "@/components/payment/CardForm";
import { TipPaymentSession, type IPerformPaymentBody } from "@/services/top-payment.service";
import { deserialize } from "common/currency-utils.js";
import { createContext, useContext, useRef, useState, type FormEventHandler } from "react";

export const Shift4Context = createContext<Shift4Object | null>(null)

export const useShift4Obj = (): Shift4Object | null => {
    return useContext(Shift4Context)
}

export type PaymentResult = {
    success: boolean;
};


export const useShift4Form = () => {
    const shift4Obj = useShift4Obj()
    const formRef = useRef<HTMLFormElement | null>(null)
    const cardFormRef = useRef<ICarfFormRef | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)

    const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault()

        if (!cardFormRef.current?.shift4GroupObject || !shift4Obj || !formRef.current) return;

        setLoading(true)

        const session = TipPaymentSession.of(shift4Obj, cardFormRef.current.shift4GroupObject)

        session.tipPayment(formToPaymentBody(formRef.current))
            .then(() => setPaymentResult({ success: true }))
            .catch(() => setPaymentResult({ success: false }))
            .finally(() => {
                setLoading(false)
            })
    }

    return { shift4Obj, formRef, cardFormRef, onSubmit, loading, paymentResult }
}

const formToPaymentBody = (form: HTMLFormElement): IPerformPaymentBody => {
    const data = new FormData(form)
    const body: IPerformPaymentBody = {
        country: data.get('country') as string,
        amount: deserialize(data.get('amount') as string),
    }

    // TODO: add validation

    return body
}
