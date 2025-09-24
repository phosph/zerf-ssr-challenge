import type { ReactNode } from "react";
import styles from './MetricCard.module.css';
import { Card, CardContent } from "./card";

export interface IMetricCardProps {
    label: string;
    value: string;
    icon: ReactNode
}

console.log(styles)

export function MetricCard({
    icon,
    label,
    value
}: IMetricCardProps) {
    return (
        <Card className={styles["metrict-card-wrapper"]}>
            <CardContent>
                <article className={styles["metrict-card"]}>
                    <div className={styles["label"]}>{label}</div>
                    <div className={styles["value"]}>{value}</div>
                    <div className={styles["icon"]}>{icon}</div>
                </article>
            </CardContent>
        </Card>
    )
}