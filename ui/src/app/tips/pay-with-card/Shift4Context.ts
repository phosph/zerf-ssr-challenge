import type { ICarfFormRef } from "@/components/payment/CardForm";
import { TipPaymentSession, type IPerformPaymentBody } from "@/services/top-payment.service";
import { createContext, useContext, useRef, useState, type FormEventHandler } from "react";

export const Shift4Context = createContext<Shift4Object | null>(null)

export const useShift4Obj = (): Shift4Object | null => {
    return useContext(Shift4Context)
}


export const useShift4Form = () => {
    const shift4Obj = useShift4Obj()
    const formRef = useRef<HTMLFormElement | null>(null)
    const carfFormRef = useRef<ICarfFormRef | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault()

        if (!carfFormRef.current?.shift4GroupObject || !shift4Obj || !formRef.current) return;
        
        setLoading(true)
        
        const session = TipPaymentSession.of(shift4Obj, carfFormRef.current.shift4GroupObject)

        session.tipPayment(formToPaymentBody(formRef.current))
            .then(() => {
                // TODO: show success/error state
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return { shift4Obj, formRef, carfFormRef, onSubmit, loading }
}

const formToPaymentBody = (form: HTMLFormElement): IPerformPaymentBody => {
    const data = new FormData(form)
    const body:  IPerformPaymentBody = {
        country: data.get('country') as string,
        amount: Number(data.get('amount')),
    }

    // TODO: add validation

    return body
}