"use client"

import { Pie, PieChart } from "recharts"

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart"
import { TipsPercentageByPaymentType } from "common/dashboard/types"

export const description = "A simple pie chart"

export function PaymentMethodsChart({ dataset }: { dataset: TipsPercentageByPaymentType | null }) {

    const tipsPercentageByPaymentType = dataset?.tipsPercentageByPaymentType ?? []

    const chartConfig = Object.fromEntries(tipsPercentageByPaymentType.map(item => ([
        item.paymentType,
        {
            label: item.paymentType,
            color: 'red',
        }
    ])))

    return (
        <article className="card flex-1">
            <header className="text-[#2F363C] font-medium py-3 px-6 border-b border-[#DDE1E4]">
                <h5>Payment Method</h5>
            </header>
            <div className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <Pie data={tipsPercentageByPaymentType} dataKey="percentage" nameKey="paymentType" />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="paymentType" />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </div>
        </article>
    )
}
