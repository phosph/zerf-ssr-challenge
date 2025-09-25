'use client'

import { useEffect, useState } from "react";

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