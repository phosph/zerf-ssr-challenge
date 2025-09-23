'use client'

import TipOption, { customAmount, type ITipOptionProps } from '@/app/ui/TipOption'
import GreetingsHeader from '../ui/GreetingsHeader'
import PaymentButtons from '../ui/PaymentButtons'
import { useState } from 'react'

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
        <>
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
            <PaymentButtons amount={totalAmount} />
        </>
    )
}