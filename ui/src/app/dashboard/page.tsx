import { MetricCard } from "@/components/ui/MetricCard";
import { AverageTipChart } from "./AverageTipChart";
import { PaymentMethodsChart } from "./PaymentMethodsChart";

export default function DashboardPage() {
    return (
        <>
            <div>
                <header>
                    <h1>Dashboard</h1>
                    <p>View and analyze tip data across your properties.</p>
                </header>
                <div>
                    filtros
                </div>
            </div>
            <section className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <MetricCard label="hola" value="hola" icon={null} />
                    <MetricCard label="hola" value="hola" icon={null} />
                    <MetricCard label="hola" value="hola" icon={null} />
                    <MetricCard label="hola" value="hola" icon={null} />
                    <MetricCard label="hola" value="hola" icon={null} />
                </div>
                <div className="flex gap-3">
                    <AverageTipChart />
                    <PaymentMethodsChart />
                </div>
            </section>
        </>
    )
}