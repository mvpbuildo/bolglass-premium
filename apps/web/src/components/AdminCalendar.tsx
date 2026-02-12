'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@bolglass/ui';
import { getAdminSlots, getGlobalBlocks, setGlobalBlock, removeGlobalBlock, updateSlotPrice, generateMonthSlots } from '../app/[locale]/actions';

export default function AdminCalendar() {
    const [viewDate, setViewDate] = useState(new Date());
    const [slots, setSlots] = useState<any[]>([]);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const [s, b] = await Promise.all([getAdminSlots(), getGlobalBlocks()]);
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

    const handlePriceUpdate = async (slotId: string, currentPrice: number | null) => {
        const newPrice = prompt('Podaj nową cenę (lub zostaw puste dla domyślnej 150 zł):', currentPrice?.toString() || '');
        if (newPrice === null) return;
        const price = newPrice === '' ? null : parseInt(newPrice);
        await updateSlotPrice(slotId, price);
        fetchData();
    };

    const getDayStatus = (day: number) => {
        const dateStr = `${currentMonthStr}-${day.toString().padStart(2, '0')}`;
        const daySlots = slots.filter(s => new Date(s.date).toISOString().startsWith(dateStr));
        const isBlocked = blocks.some(b => b.type === 'DATE' && b.value === dateStr);

        if (isBlocked) return 'bg-gray-800 text-white';
        if (daySlots.length === 0) return 'bg-gray-50 text-gray-300';

        const totalRemaining = daySlots.reduce((sum, s) => sum + s.remainingCapacity, 0);
        if (totalRemaining === 0) return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-green-100 text-green-700 border-green-200 cursor-pointer hover:bg-green-200';
    };

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    const handleGenerateSlots = async () => {
        if (confirm(`Czy na pewno chcesz wygenerować sloty (8:00-17:00) dla miesiąca ${currentMonthStr}?`)) {
            setLoading(true);
            const res = await generateMonthSlots(viewDate.getFullYear(), viewDate.getMonth());
            if (res.success) {
                alert('Sloty zostały wygenerowane pomyślnie!');
                fetchData();
            } else {
                alert('Błąd podczas generowania slotów: ' + res.error);
                setLoading(false);
            }
        }
    };

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
                    <Button variant="outline" size="sm" onClick={handleGenerateSlots} disabled={loading}>
                        Generuj Terminy
                    </Button>
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
                        onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all p-1 text-sm font-bold relative group ${getDayStatus(day)} ${isMonthBlocked ? 'opacity-20 pointer-events-none' : ''} ${selectedDay === day ? 'ring-2 ring-red-500 ring-offset-2 scale-105 z-10' : ''}`}
                    >
                        {day}
                        {slots.some(s => new Date(s.date).toISOString().startsWith(`${currentMonthStr}-${day.toString().padStart(2, '0')}`) && s.price) && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                        )}
                    </div>
                ))}
            </div>

            {selectedDay && (
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-900">
                            Zarządzanie: {selectedDay} {viewDate.toLocaleString('pl-PL', { month: 'long' })}
                        </h4>
                        <Button variant="outline" size="sm" onClick={() => handleBlockDay(selectedDay)}>
                            {blocks.some(b => b.type === 'DATE' && b.value === `${currentMonthStr}-${selectedDay.toString().padStart(2, '0')}`) ? 'Odblokuj Dzień' : 'Zablokuj Dzień'}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {slots
                            .filter(s => new Date(s.date).toISOString().startsWith(`${currentMonthStr}-${selectedDay.toString().padStart(2, '0')}`))
                            .map(slot => (
                                <div key={slot.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                    <div className="text-sm">
                                        <span className="font-bold">{new Date(slot.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="ml-2 text-gray-400">{slot.remainingCapacity} / {slot.capacity} miejsc</span>
                                    </div>
                                    <button
                                        onClick={() => handlePriceUpdate(slot.id, slot.price)}
                                        className="text-xs font-bold px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full hover:bg-yellow-100 transition-colors"
                                    >
                                        Price: {slot.price || 150} zł
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

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
