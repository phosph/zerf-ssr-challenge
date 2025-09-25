import type { ReactNode } from "react";
import styles from './MetricCard.module.css';

export interface IMetricCardProps {
    label: string;
    value: string;
    icon: ReactNode
}

export function MetricCard({
    icon,
    label,
    value
}: IMetricCardProps) {
    return (
        <article className={`${styles["metric-card"]} card`}>
            <div className={styles["label"]}>{label}</div>
            <div className={styles["value"]}>{value}</div>
            <div className={styles["icon"]}>{icon}</div>
        </article>
    )
}
