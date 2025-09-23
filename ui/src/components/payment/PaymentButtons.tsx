"use client"

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import ActionFooter from "../ui/ActionFooter";
import ApplePayButton from "./ApplePayButton";
import type { MouseEventHandler } from "react";
import { Loader2Icon } from "lucide-react"

export interface IPaymentButtonsProps {
    amount: number | null;
    /** @default {false} */
    showApplePayButton?: boolean
    onPayWithCard: MouseEventHandler<HTMLButtonElement>
    loading?: boolean
}

export default function PaymentButtons({ amount, showApplePayButton = false, onPayWithCard, loading }: IPaymentButtonsProps) {

    const disablePayment = !(Number(amount) > 0) || loading

    return (
        <ActionFooter className="flex flex-col gap-4 min-h-40">
            <div className="flex justify-between">
                <span>Total Tip</span>
                <span>USD ${amount ?? '--'}</span>
            </div>
            {showApplePayButton && <ApplePayButton disabled={disablePayment} />}
            <Button variant="outline" disabled={disablePayment} onClick={onPayWithCard} type="button">
                {loading && <Loader2Icon className="animate-spin" />}
                <Image src="/card-icon.svg" alt="card" width={20} height={20} role="presentation" />
                Pay With Card
            </Button>
        </ActionFooter>
    )
}