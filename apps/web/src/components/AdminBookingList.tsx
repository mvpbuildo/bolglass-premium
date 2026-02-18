'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@bolglass/ui';
import { getAllBookings, deleteBooking, updateBookingAdmin, createBooking, getAdminSlots, sendBookingReminder } from '../app/[locale]/actions';

export default function AdminBookingList() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Manual Form States
    const [slots, setSlots] = useState<any[]>([]);
    const [formData, setFormData] = useState({ date: '', time: '', name: '', email: '', people: '1', type: 'SIGHTSEEING', isGroup: false, institutionName: '', institutionAddress: '' });

    // ... (filtering states unchanged)

    const handleAddManual = async () => {
        if (!formData.date || !formData.time || !formData.name || !formData.email) return alert('Wypełnij wymagane pola (Data, Godzina, Imię, Email)!');

        // Construct Date object including time (assume local time input matches server expectation or handle timezone if strict)
        // Since createBooking expects a date string or object, and we fixed backend to be robust...
        // Let's create a local date object and pass it.
        const fullDateStr = `${formData.date}T${formData.time}:00`;
        const bookingDate = new Date(fullDateStr);

        const res = await createBooking({
            ...formData,
            date: bookingDate.toISOString(),
            people: parseInt(formData.people),
            slotId: undefined
        }, true); // isAdminOverride = true

        if (res.success) {
            setIsAdding(false);
            setFormData({ date: '', time: '', name: '', email: '', people: '1', type: 'SIGHTSEEING', isGroup: false, institutionName: '', institutionAddress: '' });
            fetchBookings();
        } else {
            alert('Błąd: ' + res.error);
        }
    };

    const handleUpdate = async (id: string, notes: string) => {
        await updateBookingAdmin(id, { adminNotes: notes });
        fetchBookings();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć tę rezerwację?')) return;
        const result = await deleteBooking(id);
        if (result.success) fetchBookings();
    };

    // Filter and Sort Logic
    const filteredAndSortedBookings = bookings
        .filter(b => {
            const matchesSearch = b.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
                b.email.toLowerCase().includes(filterSearch.toLowerCase());
            const matchesType = filterType === 'ALL' || b.type === filterType;

            const bDate = new Date(b.date).getTime();
            const matchesDateFrom = !filterDateFrom || bDate >= new Date(filterDateFrom).setHours(0, 0, 0, 0);
            const matchesDateTo = !filterDateTo || bDate <= new Date(filterDateTo).setHours(23, 59, 59, 999);

            return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
        })
        .sort((a, b) => {
            if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'people_asc') return a.people - b.people;
            if (sortBy === 'people_desc') return b.people - a.people;
            if (sortBy === 'price_asc') return (a.people * a.priceBase) - (b.people * b.priceBase);
            if (sortBy === 'price_desc') return (b.people * b.priceBase) - (a.people * a.priceBase);
            return 0;
        });

    const handleExport = () => {
        const headers = ["Data", "Godzina", "Klient", "Email", "Pakiet", "Osob", "Cena/os", "Suma", "Grupa", "Instytucja", "Adres Instytucji", "Notatki"];
        const rows = filteredAndSortedBookings.map(b => [
            new Date(b.date).toLocaleDateString('pl-PL'),
            new Date(b.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            b.name,
            b.email,
            b.type === 'WORKSHOP' ? 'Warsztaty' : 'Zwiedzanie',
            b.people,
            b.priceBase,
            b.people * b.priceBase,
            b.isGroup ? "TAK" : "NIE",
            b.institutionName || "",
            b.institutionAddress || "",
            (b.adminNotes || "").replace(/,/g, ";")
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `rezerwacje_bolglass_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie rezerwacji...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Lista Rezerwacji</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport} className="border-green-600 text-green-700 hover:bg-green-50">
                        📊 Eksportuj Excel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? 'Anuluj Dodawanie' : '+ Dodaj Ręcznie'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchBookings}>Odśwież</Button>
                </div>
            </div>

            {/* Filters and Sorting Controls */}
            <Card className="p-4 bg-white shadow-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Szukaj</label>
                        <input
                            placeholder="Imię, email..."
                            className="w-full p-2 text-sm border rounded bg-white"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Pakiet</label>
                        <select
                            className="w-full p-2 text-sm border rounded bg-white"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="ALL">Wszystkie</option>
                            <option value="SIGHTSEEING">Zwiedzanie</option>
                            <option value="WORKSHOP">Warsztaty</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Od Daty</label>
                        <input
                            type="date"
                            className="w-full p-2 text-sm border rounded bg-white"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Do Daty</label>
                        <input
                            type="date"
                            className="w-full p-2 text-sm border rounded bg-white"
                            value={filterDateTo}
                            onChange={(e) => setFilterDateTo(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Sortuj według</label>
                        <select
                            className="w-full p-2 text-sm border rounded bg-white"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="date_desc">Data: Najnowsze</option>
                            <option value="date_asc">Data: Najstarsze</option>
                            <option value="people_desc">Ludzi: Najwięcej</option>
                            <option value="people_asc">Ludzi: Najmniej</option>
                            <option value="price_desc">Suma: Najwyższa</option>
                            <option value="price_asc">Suma: Najniższa</option>
                        </select>
                    </div>
                </div>
            </Card>

            {isAdding && (
                <Card className="p-6 bg-red-50 border-red-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4 text-red-900">Nowa Rezerwacja (Tryb Admin)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="date"
                            title="Data rezerwacji"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <input
                            type="time"
                            title="Godzina rezerwacji"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                        <input
                            placeholder="Imię i Nazwisko"
                            title="Imię i Nazwisko klienta"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            placeholder="Email"
                            title="Email klienta"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            placeholder="Liczba osób"
                            title="Liczba osób"
                            type="number"
                            min="1"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.people}
                            onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                        />
                        <select
                            title="Rodzaj rezerwacji"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="SIGHTSEEING">👀 Zwiedzanie</option>
                            <option value="WORKSHOP">🎨 Warsztaty</option>
                        </select>
                        <select
                            title="Czy to grupa zorganizowana?"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.isGroup ? 'true' : 'false'}
                            onChange={(e) => setFormData({ ...formData, isGroup: e.target.value === 'true' })}
                        >
                            <option value="false">👤 Indywidualna</option>
                            <option value="true">🏫 Grupa</option>
                        </select>
                        {formData.isGroup && (
                            <>
                                <input
                                    placeholder="Nazwa Instytucji"
                                    className="p-2 border rounded bg-white text-sm"
                                    value={formData.institutionName}
                                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                                />
                                <input
                                    placeholder="Adres Instytucji"
                                    className="p-2 border rounded bg-white text-sm"
                                    value={formData.institutionAddress}
                                    onChange={(e) => setFormData({ ...formData, institutionAddress: e.target.value })}
                                />
                            </>
                        )}
                    </div>
                    <Button className="mt-4" onClick={handleAddManual}>Zapisz Rezerwację</Button>
                </Card>
            )}

            <Card className="border-none shadow-lg">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50 text-gray-600 text-[10px] uppercase font-semibold">
                            <tr>
                                <th className="px-3 py-2">Termin</th>
                                <th className="px-3 py-2">Dane Klienta</th>
                                <th className="px-3 py-2">Pakiet</th>
                                <th className="px-3 py-2 text-center">Osób/Cena</th>
                                <th className="px-3 py-2">Notatki Admina</th>
                                <th className="px-3 py-2 text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 italic text-sm">
                            {filteredAndSortedBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 not-italic">
                                        Brak rezerwacji spełniających kryteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2">
                                            <div className="font-bold text-gray-900 not-italic text-sm">
                                                {new Date(booking.date).toLocaleDateString('pl-PL')}
                                            </div>
                                            <div className="text-[10px] text-red-600 font-medium not-italic">
                                                {new Date(booking.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 not-italic">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-sm truncate max-w-[150px]" title={booking.name}>{booking.name}</div>
                                                {booking.isGroup && <span title="Grupa Zorganizowana" className="cursor-help text-lg">🏫</span>}
                                            </div>
                                            <div className="text-[10px] text-gray-400 truncate max-w-[150px]" title={booking.email}>{booking.email}</div>
                                            {booking.isGroup && (
                                                <div className="mt-1 p-1.5 bg-red-50 border border-red-100 rounded text-[10px] text-red-800 font-medium">
                                                    <div className="font-bold uppercase tracking-tighter">Instytucja:</div>
                                                    <div className="truncate" title={booking.institutionName}>{booking.institutionName}</div>
                                                    <div className="text-red-600/60 truncate" title={booking.institutionAddress}>{booking.institutionAddress}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 not-italic">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${booking.type === 'WORKSHOP'
                                                ? 'bg-red-100 text-red-600 border border-red-200'
                                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {booking.type === 'WORKSHOP' ? '🎨 Warsztaty' : '👀 Zwiedzanie'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center not-italic">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-red-600 text-sm">{booking.people} os.</span>
                                                <span className="text-[10px] text-gray-400">({booking.priceBase} zł/os)</span>
                                                <span className="text-xs font-black text-gray-900 border-t border-gray-100 mt-0.5 pt-0.5">
                                                    {booking.people * booking.priceBase} zł
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 not-italic">
                                            <input
                                                defaultValue={booking.adminNotes || ''}
                                                onBlur={(e) => handleUpdate(booking.id, e.target.value)}
                                                placeholder="Dodaj notatkę..."
                                                className="text-[11px] p-1 border border-transparent hover:border-gray-200 rounded w-full focus:bg-white bg-transparent transition-all truncate focus:w-auto focus:absolute focus:z-10 focus:shadow-md focus:min-w-[200px]"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right not-italic space-x-1">
                                            <button
                                                title={booking.reminderSentAt ? `Przypomnienie wysłane: ${new Date(booking.reminderSentAt).toLocaleTimeString()}` : "Wyślij przypomnienie"}
                                                onClick={() => handleSendReminder(booking.id)}
                                                className={`transition-colors p-1 rounded hover:bg-gray-100 ${booking.reminderSentAt ? 'text-green-500' : 'text-blue-400 hover:text-blue-600'}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                            <button
                                                title="Usuń rezerwację"
                                                onClick={() => handleDelete(booking.id)}
                                                className="text-gray-300 hover:text-red-600 transition-colors p-1 rounded hover:bg-gray-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-red-50 border-red-100">
                    <p className="text-xs text-red-600 font-bold uppercase">Suma rezerwacji</p>
                    <p className="text-2xl font-black text-red-900">{bookings.length}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase">Łącznie osób</p>
                    <p className="text-2xl font-black text-gray-900">
                        {filteredAndSortedBookings.reduce((sum, b) => sum + b.people, 0)}
                    </p>
                </Card>
            </div>
        </div>
    );
}
