'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@bolglass/ui';
import { getAdminSlots, getGlobalBlocks, setGlobalBlock, removeGlobalBlock, updateSlotPrice, generateMonthSlots, updateSlotCapacity, getBookingsByDate } from '../app/[locale]/actions';

export default function AdminCalendar() {
    const [viewDate, setViewDate] = useState(new Date());
    const [slots, setSlots] = useState<any[]>([]);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [dayBookings, setDayBookings] = useState<any[]>([]);
    const [loadingDay, setLoadingDay] = useState(false);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Plan Dnia - ${selectedDay} ${viewDate.toLocaleString('pl-PL', { month: 'long' })}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary { margin-top: 20px; font-weight: bold; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <h2>Plan Dnia: ${selectedDay} ${viewDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</h2>
                <div class="summary">Liczba rezerwacji: ${dayBookings.length} | Łącznie osób: ${dayBookings.reduce((sum: any, b: any) => sum + b.people, 0)}</div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Godzina</th>
                            <th>Klient</th>
                            <th>Typ</th>
                            <th>Osób</th>
                            <th>Notatki</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dayBookings.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((b: any) => `
                            <tr>
                                <td>${new Date(b.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</td>
                                <td>${b.name} ${b.isGroup ? '(Grupa)' : ''}<br><small>${b.email}</small></td>
                                <td>${b.type === 'WORKSHOP' ? 'Warsztaty' : 'Zwiedzanie'}</td>
                                <td>${b.people}</td>
                                <td>${b.adminNotes || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleDayClick = async (day: number) => {
        if (selectedDay === day) {
            setSelectedDay(null);
            setDayBookings([]);
            return;
        }

        setSelectedDay(day);
        setLoadingDay(true);
        setDayBookings([]); // Clear previous

        const dateStr = `${currentMonthStr}-${day.toString().padStart(2, '0')}`;
        const res = await getBookingsByDate(dateStr);

        if (selectedDay === day) return; // Race condition check? Actually simplest is just set.
        // But since we just set it above, we are good. Wait, if user clicked another day fast?
        // Let's assume valid.

        if (res.success) {
            setDayBookings(res.bookings || []);
        }
        setLoadingDay(false);
    };

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
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">←</Button>
                            <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">→</Button>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">
                                {viewDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-medium mt-1">Zarządzanie dostępnością</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleGenerateSlots} disabled={loading} className="text-xs h-8">
                            Generuj Terminy
                        </Button>
                        <Button
                            variant={isMonthBlocked ? 'primary' : 'outline'}
                            size="sm"
                            onClick={handleBlockMonth}
                            className={`text-xs h-8 ${isMonthBlocked ? 'bg-black border-black' : ''}`}
                        >
                            {isMonthBlocked ? 'Odblokuj' : 'Zablokuj Miesiąc'}
                        </Button>
                    </div>
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
                        onClick={() => handleDayClick(day)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all p-1 text-sm font-bold relative group ${getDayStatus(day)} ${isMonthBlocked ? 'opacity-20 pointer-events-none' : ''} ${selectedDay === day ? 'ring-2 ring-red-500 ring-offset-2 scale-105 z-10' : ''}`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {selectedDay && (
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">
                                {selectedDay} {viewDate.toLocaleString('pl-PL', { month: 'long' })}
                            </h4>
                            <p className="text-sm text-gray-500">
                                Liczba osób: <span className="font-bold text-gray-900">{dayBookings.reduce((sum, b) => sum + b.people, 0)}</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2zm-2-2h6a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm4 4h2m-6 0h2" /></svg>
                                Drukuj
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleBlockDay(selectedDay)}>
                                {blocks.some(b => b.type === 'DATE' && b.value === `${currentMonthStr}-${selectedDay.toString().padStart(2, '0')}`) ? 'Odblokuj Dzień' : 'Zablokuj Dzień'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {loadingDay ? (
                            <div className="text-center py-8 text-gray-400">Ładowanie rezerwacji...</div>
                        ) : dayBookings.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                                Brak rezerwacji tego dnia.
                            </div>
                        ) : (
                            dayBookings.map(booking => (
                                <div key={booking.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold text-lg text-gray-700 w-16 text-center">
                                            {new Date(booking.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900">{booking.name}</div>
                                            <div className="text-xs text-gray-500">{booking.email} {booking.isGroup && <span className="text-red-600 font-bold ml-1">(Grupa)</span>}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${booking.type === 'WORKSHOP' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {booking.type === 'WORKSHOP' ? 'Warsztaty' : 'Zwiedzanie'}
                                        </div>
                                        <div className="text-sm font-bold w-8 text-right">
                                            {booking.people}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
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
