'use client'

import { MetricCard } from "@/components/ui/MetricCard";
import { DashboardFilters, useRealtimeStats } from "@/hooks/use-realtime-stats";
import { Banknote, Plane, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AverageTipChart } from "./AverageTipChart";
import { PaymentMethodsChart } from "./PaymentMethodsChart";
import { StatsFilter } from "./StatsFilter";
import { currencyFormat } from "common/currency-utils.js";

export default function DashboardPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null)
    const stats = useRealtimeStats(filters)

    return (
        <>
            <div className="flex justify-between items-center gap-12 flex-wrap mb-4">
                <header>
                    <h1 className="text-[#2F363C] font-medium text-2xl">Dashboard</h1>
                    <p className="text-[#818995] text-sm">View and analyze tip data across your properties.</p>
                </header>
                <StatsFilter onFilterChange={setFilters} currentFilters={filters} />
            </div>
            <section className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <MetricCard label="total tips" value={`${currencyFormat(stats?.totalTips ?? 0)}`} icon={<Banknote />} />
                    <MetricCard label="average tips" value={`${currencyFormat(stats?.averageTips ?? 0)}`} icon={<TrendingUp />} />
                    <MetricCard label="Transactions Amount" value={`${stats?.transactionAmount ?? 0}`} icon={<Plane />} />
                </div>
                <div className="flex gap-3">
                    <AverageTipChart dataset={stats} />
                    <PaymentMethodsChart dataset={stats} />
                </div>
            </section>
        </>
    );
}
