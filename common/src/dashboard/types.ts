export interface ICharge {
    id?: string;
    chargeExternalId: string
    created: number; // timestamp
    amount: number; // integer
    currency: string;
    status: "successful" | "pending" | "failed"
}

export type CurrencyAmount = number

// TODO: use shared lib
export interface PaymentStats {
    totalTips: number;
    transactionAmount: number
    averageTips: number;
}

export interface DashboardFilters {
    startDate: string;
    endDate?: string;
}

export interface ITipPyamentBody {
    tokenId: string;
    country: string;
    amount: CurrencyAmount;
}
