export interface ICharge {
    id?: number;
    chargeExternalId: string
    created: number; // timestamp
    amount: number; // integer
    currency: string;
    status: "successful" | "pending" | "failed"
}

export type CurrencyAmount = number


export interface SummarizedTipsStats {
    totalTips: number;
    transactionAmount: number
    averageTips: number;
}

export interface AverageTipsSet {
    averageTipsSet: {
        list: {
            day: Date | string /* ISO-date by default */;
            averageTips: number;
        }[]
        dateRange: {
            startDate: string;
            endDate: string;
        }
    },

}

export interface TipsPercentageByPaymentType {
    tipsPercentageByPaymentType: {
        paymentType: string;
        percentage: number;
    }[]
}

export interface PaymentStats extends SummarizedTipsStats, AverageTipsSet, TipsPercentageByPaymentType {
}

// FILTERS

export interface CommonTipsStatsFilters {
    startDate: string;
    endDate?: string;
    /** @default {["successful"]} */
    status?: ICharge['status'][]
}

export interface SummarizedTipsStatsFilters extends CommonTipsStatsFilters { }

export interface AverageTipsSetFilters extends CommonTipsStatsFilters { }


export interface DashboardFilters extends SummarizedTipsStatsFilters, AverageTipsSetFilters { };


// ==========

export interface ITipPaymentBody {
    tokenId: string;
    country: string;
    amount: CurrencyAmount;
}
