'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@bolglass/ui';
import { getAvailableSlots, getGlobalBlocks, setGlobalBlock, removeGlobalBlock } from '../app/[locale]/actions';

export default function AdminCalendar() {
    const [viewDate, setViewDate] = useState(new Date());
    const [slots, setSlots] = useState<any[]>([]);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const [s, b] = await Promise.all([getAvailableSlots(), getGlobalBlocks()]);
        setSlots(s);
        setBlocks(b);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    // Adjust for Monday start (JS is 0-Sunday, 1-Monday)
    const firstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    const currentMonthStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const isMonthBlocked = blocks.find(b => b.type === 'MONTH' && b.value === currentMonthStr);

    const handleBlockMonth = async () => {
        if (isMonthBlocked) {
            await removeGlobalBlock(isMonthBlocked.id);
        } else {
            if (confirm(`Czy na pewno chcesz zablokować CAŁY miesiąc ${currentMonthStr}?`)) {
                await setGlobalBlock('MONTH', currentMonthStr, 'Blokada administracyjna');
            }
        }
        fetchData();
    };

    const handleBlockDay = async (day: number) => {
        const dateStr = `${currentMonthStr}-${day.toString().padStart(2, '0')}`;
        const existingBlock = blocks.find(b => b.type === 'DATE' && b.value === dateStr);

        if (existingBlock) {
            await removeGlobalBlock(existingBlock.id);
        } else {
            if (confirm(`Zablokować dzień ${dateStr}?`)) {
                await setGlobalBlock('DATE', dateStr, 'Blokada dnia');
            }
        }
        fetchData();
    };

    const getDayStatus = (day: number) => {
        const dateStr = `${currentMonthStr}-${day.toString().padStart(2, '0')}`;
        const daySlots = slots.filter(s => s.date.toISOString().startsWith(dateStr));
        const isBlocked = blocks.some(b => b.type === 'DATE' && b.value === dateStr);

        if (isBlocked) return 'bg-gray-800 text-white';
        if (daySlots.length === 0) return 'bg-gray-50 text-gray-300';

        const totalRemaining = daySlots.reduce((sum, s) => sum + s.remainingCapacity, 0);
        if (totalRemaining === 0) return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-green-100 text-green-700 border-green-200 cursor-pointer hover:bg-green-200';
    };

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    return (
        <Card className="p-6 bg-white shadow-xl border-none">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {viewDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Kliknij dzień, aby go zablokować/odblokować</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={prevMonth}>←</Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>→</Button>
                    <Button
                        variant={isMonthBlocked ? 'primary' : 'outline'}
                        size="sm"
                        onClick={handleBlockMonth}
                        className={isMonthBlocked ? 'bg-black border-black' : ''}
                    >
                        {isMonthBlocked ? 'Odblokuj Miesiąc' : 'Zablokuj Miesiąc'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 mb-4 uppercase">
                <div>Pn</div><div>Wt</div><div>Śr</div><div>Cz</div><div>Pt</div><div>So</div><div>Nd</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {emptyDays.map(i => <div key={`e-${i}`} className="aspect-square"></div>)}
                {days.map(day => (
                    <div
                        key={day}
                        onClick={() => handleBlockDay(day)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all p-1 text-sm font-bold ${getDayStatus(day)} ${isMonthBlocked ? 'opacity-20 pointer-events-none' : ''}`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                    <span>Dostępne</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                    <span>Pełne</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-800 rounded"></div>
                    <span>Zablokowane</span>
                </div>
            </div>
        </Card>
    );
}
