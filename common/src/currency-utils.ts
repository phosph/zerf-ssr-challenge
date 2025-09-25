import BigNumber from "bignumber.js";
import type { CurrencyAmount } from "./dashboard/types";

BigNumber.set({ DECIMAL_PLACES: 2 })

export const MIN_CURRENCY_AMOUNT = 10

export const isValid = (value: CurrencyAmount): boolean => {
    return value > MIN_CURRENCY_AMOUNT && value === (value | 0)
}


export const currencyFormat = (value: CurrencyAmount): string => {
    return `$${new BigNumber(value).div(100).toFixed()}`
}


export const serialice = (value: CurrencyAmount): string => {
    return value.toString()
}

// TODO: review
export const deserialice = (value: string): CurrencyAmount => {
    return new BigNumber(value).toNumber()
}


export const currencyFromNaturalNumber = (num: number): CurrencyAmount => {
    return (num | 0) * 100
}
