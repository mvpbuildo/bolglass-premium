'use server';

import { prisma } from '@bolglass/database';

export async function getDashboardStats() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        // --- VISITS ---
        const todayStats = await prisma.analyticsDay.findUnique({
            where: { date: today }
        });

        // Last 30 days visits for chart
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const visitsHistory = await prisma.analyticsDay.findMany({
            where: { date: { gte: thirtyDaysAgo } },
            orderBy: { date: 'asc' }
        });

        // --- ORDERS & REVENUE (This Month) ---
        const thisMonthOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startOfMonth },
                status: { not: 'CANCELLED' }
            },
            select: { total: true }
        });

        const revenue = thisMonthOrders.reduce((sum, order) => sum + order.total, 0);
        const ordersCount = thisMonthOrders.length;

        // --- SALES (Last Month Comparison) ---
        const lastMonthOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                status: { not: 'CANCELLED' }
            },
            select: { total: true }
        });
        const revenueLastMonth = lastMonthOrders.reduce((sum, order) => sum + order.total, 0);

        // --- CHART DATA (Sales Last 30 Days) ---
        // We need to aggregate orders by day
        const salesHistory = await prisma.order.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: { not: 'CANCELLED' }
            },
            select: { createdAt: true, total: true }
        });

        // Merge Sales & Visits into Chart Data
        // Map dates
        const charMap = new Map<string, { date: string, sales: number, visits: number }>();

        // Init map with all days
        for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const iso = d.toISOString().split('T')[0];
            charMap.set(iso, { date: iso, sales: 0, visits: 0 });
        }

        // Fill Visits
        visitsHistory.forEach(v => {
            const iso = v.date.toISOString().split('T')[0];
            if (charMap.has(iso)) {
                charMap.get(iso)!.visits = v.views;
            }
        });

        // Fill Sales
        salesHistory.forEach(o => {
            const iso = o.createdAt.toISOString().split('T')[0];
            if (charMap.has(iso)) {
                const entry = charMap.get(iso)!;
                entry.sales += o.total;
            }
        });

        const chartData = Array.from(charMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        return {
            visitsToday: todayStats?.views || 0,
            revenueMonth: revenue,
            revenueLastMonth: revenueLastMonth,
            ordersMonth: ordersCount,
            chartData
        };

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return {
            visitsToday: 0,
            revenueMonth: 0,
            revenueLastMonth: 0,
            ordersMonth: 0,
            chartData: []
        };
    }
}
