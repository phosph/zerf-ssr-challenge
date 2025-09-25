'use client'

import type { AverageTipsSet, DashboardFilters, PaymentStats } from "common/dashboard/types";
import { eachDayOfInterval, parseJSON } from "date-fns";
import { useEffect, useState } from "react";

export { type DashboardFilters };

export function useRealtimeStats(filters: DashboardFilters | null) {
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/dashboard/ws`);

        ws.addEventListener('open', () => {
            console.log('WebSocket connection established');
        });

        ws.addEventListener('message', (event: MessageEvent<string>) => {
            const newStats: PaymentStats = JSON.parse(event.data);
            console.log('Received stats update:', newStats);
            completeChartData(newStats)
            setStats(newStats);
        });

        ws.addEventListener('close', () => {
            console.log('WebSocket connection closed');
        });

        ws.addEventListener('error', (error: Event) => {
            console.error('WebSocket error:', error);
        });

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        if (socket && filters) {
            console.log('Sending filters:', filters);
            socket.send(JSON.stringify(filters));
        }
    }, [socket, filters])

    return stats;
}


function completeChartData(dataSet: AverageTipsSet,): void {
    const { averageTipsSet: { dateRange, list } } = dataSet
    const { startDate, endDate } = dateRange
    const startDateParsed = parseJSON(startDate)
    const endDateParsed = parseJSON(endDate)

    if (!dataSet.averageTipsSet.list.length) {
        dataSet.averageTipsSet.list = eachDayOfInterval({ start: startDateParsed, end: endDateParsed })
            .map((day) => ({ day, averageTips: 0 }))
    } else {

        dataSet.averageTipsSet.list = list.flatMap((obj, index) => {
            const day: Date = obj.day = obj.day instanceof Date ? obj.day : parseJSON(obj.day)

            if (!index) {
                return [
                    ...eachDayOfInterval({ start: startDateParsed, end: day })
                        .slice(0, -2)
                        .map((day) => ({ day, averageTips: 0 })),
                    obj
                ]
            }

            if (index === list.length - 1) {
                return [
                    obj,
                    ...eachDayOfInterval({ start: day, end: endDateParsed })
                        .slice(1)
                        .map((day) => ({ day, averageTips: 0 })),
                ]
            }

            const prevObj = list[index - 1]
            const prevDay: Date = prevObj.day instanceof Date ? prevObj.day : parseJSON(prevObj.day)

            return [
                prevObj,
                ...eachDayOfInterval({ start: prevDay, end: day })
                    .slice(1, -2)
                    .map((day) => ({ day, averageTips: 0 })),
                obj
            ]
        })
    }
}
