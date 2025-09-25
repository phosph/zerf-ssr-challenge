"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { currencyToFloat } from "common/currency-utils.js"
import { AverageTipsSet } from "common/dashboard/types"
import { format as formatDate, parseJSON } from 'date-fns'

// TODO
const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function AverageTipChart({ dataset }: { dataset: AverageTipsSet | null }) {
    const list = dataset?.averageTipsSet.list.map(item => ({
        ...item,
        averageTips: currencyToFloat(item.averageTips)
    }))


    return (
        <article className="card flex-1">
            <header className="text-[#2F363C] font-medium py-3 px-6 border-b border-[#DDE1E4]">
                <h5>Average tip</h5>
            </header>
            <div className="p-4">
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={list}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value: Date | string) => formatDate(value instanceof Date ? value : parseJSON(value), "dd LLL")}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="averageTips"
                            type="linear"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <YAxis
                            dataKey="averageTips"
                            tickLine={false}
                            axisLine={false}
                        />
                    </LineChart>
                </ChartContainer>
            </div>
        </article>
    )
}
