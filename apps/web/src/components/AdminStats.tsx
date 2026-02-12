'use client';

import { useState, useEffect } from 'react';
import { Card } from '@bolglass/ui';
import { getAdminStats } from '../app/[locale]/actions';

export default function AdminStats() {
    const [stats, setStats] = useState<{ dayStats: any, hourStats: any }>({ dayStats: {}, hourStats: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminStats().then(data => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    if (loading) return null;

    const maxDay = Math.max(...Object.values(stats.dayStats) as number[]) || 1;
    const maxHour = Math.max(...Object.values(stats.hourStats) as number[]) || 1;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white shadow-xl border-none">
                <h3 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">Popularność Dni</h3>
                <div className="flex items-end gap-2 h-40">
                    {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(day => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="w-full bg-red-50 rounded-t-lg relative flex items-end overflow-hidden h-full">
                                <div
                                    className="w-full bg-red-600 transition-all duration-1000 origin-bottom"
                                    style={{ height: `${((stats.dayStats[day] || 0) / maxDay) * 100}%` }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold text-red-900 bg-white/80 px-1 rounded">{stats.dayStats[day] || 0}</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">{day}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6 bg-white shadow-xl border-none">
                <h3 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">Popularność Godzin</h3>
                <div className="flex items-end gap-1 h-40">
                    {Array.from({ length: 10 }, (_, i) => 8 + i).map(h => {
                        const hour = h.toString().padStart(2, '0') + ':00';
                        return (
                            <div key={hour} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full bg-gray-50 rounded-t-lg relative flex items-end overflow-hidden h-full">
                                    <div
                                        className="w-full bg-black transition-all duration-1000 origin-bottom"
                                        style={{ height: `${((stats.hourStats[hour] || 0) / maxHour) * 100}%` }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-bold text-white bg-black/80 px-1 rounded">{stats.hourStats[hour] || 0}</span>
                                    </div>
                                </div>
                                <span className="text-[9px] font-medium text-gray-400 rotate-45 mt-1">{hour}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
