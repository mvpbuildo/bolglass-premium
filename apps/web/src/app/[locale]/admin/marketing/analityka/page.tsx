import { getDashboardStats } from './actions';
import { Card } from '@bolglass/ui';
import { AreaChart, BarChart, TrendingUp, Users, ShoppingCart, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

import AdminNavigation from '@/components/AdminNavigation';

export default async function AnalyticsPage() {
    const stats = await getDashboardStats();

    // Chart dimensions
    const chartHeight = 200;
    const maxVal = Math.max(...stats.chartData.map(d => Math.max(d.sales, d.visits * 10)), 100);

    return (
        <div className="space-y-8">
            <AdminNavigation />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Analityka i Statystyki</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-blue-500 bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Odwiedziny Dzisiaj</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.visitsToday}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-green-500 bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Przychód (Miesiąc)</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.revenueMonth.toFixed(2)} zł</h3>
                            <p className="text-xs text-gray-400 mt-1">Poprzedni miesiąc: {stats.revenueLastMonth.toFixed(2)} zł</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl text-green-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-purple-500 bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Zamówienia</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.ordersMonth}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Custom SVG Chart */}
            <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-600" />
                        Trend Sprzedaży i Wizyt (30 dni)
                    </h2>
                    <div className="flex gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Sprzedaż (PLN)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-full"></span> Wizyty (x10)</span>
                    </div>
                </div>

                <div className="h-[200px] w-full flex items-end gap-1">
                    {stats.chartData.map((d, i) => {
                        const salesH = (d.sales / maxVal) * chartHeight;
                        const visitsH = ((d.visits * 10) / maxVal) * chartHeight;

                        return (
                            <div key={d.date} className="flex-1 flex flex-col justify-end gap-0.5 group relative">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs p-2 rounded z-10 whitespace-nowrap">
                                    <div className="font-bold border-b border-gray-700 pb-1 mb-1">{d.date}</div>
                                    <div>Sprzedaż: {d.sales.toFixed(2)} zł</div>
                                    <div>Wizyty: {d.visits}</div>
                                </div>

                                <div style={{ height: `${salesH}px` }} className="w-full bg-green-500/80 rounded-t-sm transition-all hover:bg-green-400"></div>
                                <div style={{ height: `${visitsH}px` }} className="w-full bg-blue-400/50 rounded-t-sm transition-all hover:bg-blue-300 -mt-[100%] mix-blend-multiply"></div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600 font-bold font-mono">
                    <span>{stats.chartData[0]?.date}</span>
                    <span>{stats.chartData[Math.floor(stats.chartData.length / 2)]?.date}</span>
                    <span>{stats.chartData[stats.chartData.length - 1]?.date}</span>
                </div>
            </Card>
        </div>
    );
}
