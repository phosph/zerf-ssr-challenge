"use client"

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useApplePayAvailability } from "../../app/hooks/useApplePayAvailability";

export interface IApplePayButtonProps {
    disabled?: boolean
}


export default function ApplePayButton({ disabled }: IApplePayButtonProps) {
    const applePayAvailability = useApplePayAvailability()

    if (!applePayAvailability) return null

    return (
        <Button disabled={disabled}>
            <Image src="/apple-pay.png" alt="Apple Pay" width={48.64} height={20} />
        </Button>
    )
}