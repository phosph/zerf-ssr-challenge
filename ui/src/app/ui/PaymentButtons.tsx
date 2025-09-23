"use client"

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useApplePayAvailability } from "../hooks/useApplePayAvailability";
import ActionFooter from "./ActionFooter";

export interface IPaymentButtonsProps {
    amount: number | null
}

export default function PaymentButtons({ amount }: IPaymentButtonsProps) {
    const applePayAvailability = useApplePayAvailability()

    const disablePayment = !(Number(amount) > 0)

    return (
        <ActionFooter className="flex flex-col gap-4 min-h-40">
            <div className="flex justify-between">
                <span>Total Tip</span>
                <span>USD ${amount ?? '--'}</span>
            </div>
            {
                applePayAvailability
                    ? (
                        <Button disabled={disablePayment}>
                            <Image src="/apple-pay.png" alt="Apple Pay" width={48.64} height={20} />
                        </Button>
                    )
                    : null
            }
            <Button variant="outline" disabled={disablePayment}>
                {/* <Link href="/tips/pay-with-card"> */}
                <Image src="card-icon.svg" alt="card" width={20} height={20} role="presentation" />
                Pay With Card
                {/* </Link> */}
            </Button>
        </ActionFooter>
    )
}