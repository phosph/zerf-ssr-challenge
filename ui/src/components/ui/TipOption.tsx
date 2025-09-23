'use client'

import styles from "./TipOption.module.css";
import Image from 'next/image'

export const customAmount = Symbol("custom amount")

export interface ITipOptionProps {
    onClick: () => void,
    emoji: string;
    label: string;
    selected?: boolean;
    amount: number | typeof customAmount;
    [x: `aria-${string}`]: string;
    role?: string
}

export function TipOption({
    onClick,
    label,
    emoji,
    amount,
    selected,
    ...ariaProps
}: ITipOptionProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${styles["amount-option-button"]} ${selected ? styles['selected'] : ''}`}
            {...ariaProps}
        >
            <div className="flex gap-2 items-center">
                <Image src={emoji} alt="emoji" role="presentation" width={40.9} height={40} />
                <span className="font-medium">{label}</span>
            </div>
            <div className={styles["amount-block"]}>
                <span className="font-medium text-xl">${
                    amount === customAmount
                        ? (<span className={`${styles["unknown-amount"]}`}></span>)
                        : amount
                }</span>
                <span className="font-light">/</span>
                <span className="font-light">day</span>
            </div>
        </button>
    )
}

export { TipOption as default }