'use client'

import TipOption, { customAmount, type ITipOptionProps } from '@/components/ui/TipOption'
import { useRouter } from 'next/navigation'
import { StrictMode, useState } from 'react'
import PaymentButtons from '../../components/payment/PaymentButtons'
import GreetingsHeader from '../../components/ui/GreetingsHeader'


type IAmountOption = Pick<ITipOptionProps, 'label' | 'amount' | 'emoji'>

const options: IAmountOption[] = [
    {
        label: "Good",
        emoji: '/emoji-good.png',
        amount: 5
    },
    {
        label: "Great",
        emoji: '/emoji-great.png',
        amount: 10
    },
    {
        label: "Excellent",
        emoji: '/emoji-excellent.png',
        amount: 15
    },
    {
        label: "Custom",
        emoji: '/emoji-custom.png',
        amount: customAmount
    },
]

export default function SelectTip() {
    const router = useRouter()


    const [amount, setAmount] = useState<number | null>(null)
    const days = 6;
    const totalAmount = amount ? amount * days : null;

    const onAmountSelected = ({ amount }: IAmountOption) => {
        if (amount === customAmount) {
            // TODO: open custom amount form
        } else {
            setAmount(amount)
        }
    }

    return (
        <StrictMode>
            <GreetingsHeader days={days} />
            <ul className="flex flex-col gap-2 p-4">
                {options.map((opt, index) =>
                    <TipOption
                        key={index}
                        onClick={() => onAmountSelected(opt)}
                        selected={amount === opt.amount}
                        {...opt}
                    />
                )}
            </ul>
            <PaymentButtons showApplePayButton amount={totalAmount} onPayWithCard={() => router.push("/tips/pay-with-card")} />
        </StrictMode>
    )
}