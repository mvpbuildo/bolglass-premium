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
    const [formData, setFormData] = useState({ slotId: '', name: '', email: '', people: '1', type: 'SIGHTSEEING' });

    const fetchBookings = async () => {
        setLoading(true);
        const [bData, sData] = await Promise.all([getAllBookings(), getAdminSlots()]);
        setBookings(bData);
        setSlots(sData);
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleSendReminder = async (id: string) => {
        const res = await sendBookingReminder(id);
        if (res.success) {
            alert('Przypomnienie wysłane (symulacja)!');
            fetchBookings();
        }
    };

    const handleAddManual = async () => {
        if (!formData.slotId || !formData.name || !formData.email) return alert('Wypełnij pola!');
        const res = await createBooking({ ...formData, people: parseInt(formData.people) }, true);
        if (res.success) {
            setIsAdding(false);
            setFormData({ slotId: '', name: '', email: '', people: '1', type: 'SIGHTSEEING' });
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

    if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie rezerwacji...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Lista Rezerwacji</h2>
                <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? 'Anuluj Dodawanie' : '+ Dodaj Ręcznie'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchBookings}>Odśwież</Button>
                </div>
            </div>

            {isAdding && (
                <Card className="p-6 bg-red-50 border-red-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4 text-red-900">Nowa Rezerwacja (Tryb Admin)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            title="Wybierz slot"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.slotId}
                            onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                        >
                            <option value="">Wybierz Slot</option>
                            {slots.map(s => (
                                <option key={s.id} value={s.id}>
                                    {new Date(s.date).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </option>
                            ))}
                        </select>
                        <input
                            placeholder="Imię i Nazwisko"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            placeholder="Email"
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <select
                            className="p-2 border rounded bg-white text-sm"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="SIGHTSEEING">👀 Zwiedzanie</option>
                            <option value="WORKSHOP">🎨 Warsztaty</option>
                        </select>
                    </div>
                    <Button className="mt-4" onClick={handleAddManual}>Zapisz Rezerwację</Button>
                </Card>
            )}

            <Card className="border-none shadow-lg">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Termin</th>
                                <th className="px-6 py-4">Dane Klienta</th>
                                <th className="px-6 py-4">Pakiet</th>
                                <th className="px-6 py-4 text-center">Osób/Cena</th>
                                <th className="px-6 py-4">Notatki Admina</th>
                                <th className="px-6 py-4 text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 italic">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 not-italic">
                                        Brak rezerwacji w systemie.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 not-italic">
                                                {new Date(booking.date).toLocaleDateString('pl-PL')}
                                            </div>
                                            <div className="text-xs text-red-600 font-medium not-italic">
                                                {new Date(booking.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 not-italic">
                                            <div className="font-medium">{booking.name}</div>
                                            <div className="text-xs text-gray-400">{booking.email}</div>
                                        </td>
                                        <td className="px-6 py-4 not-italic">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${booking.type === 'WORKSHOP'
                                                ? 'bg-red-100 text-red-600 border border-red-200'
                                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {booking.type === 'WORKSHOP' ? '🎨 Warsztaty' : '👀 Zwiedzanie'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center not-italic">
                                            <div className="font-bold text-red-600">{booking.people} os.</div>
                                            <div className="text-[10px] text-gray-400 font-bold">{booking.priceBase} zł/os.</div>
                                            <div className="mt-1 text-xs font-black text-gray-900 border-t pt-1 border-gray-100">
                                                Suma: {booking.people * booking.priceBase} zł
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 not-italic">
                                            <input
                                                defaultValue={booking.adminNotes || ''}
                                                onBlur={(e) => handleUpdate(booking.id, e.target.value)}
                                                placeholder="Dodaj notatkę..."
                                                className="text-xs p-1 border border-transparent hover:border-gray-200 rounded w-full focus:bg-white"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right not-italic space-x-2">
                                            <button
                                                title={booking.reminderSentAt ? `Przypomnienie wysłane: ${new Date(booking.reminderSentAt).toLocaleTimeString()}` : "Wyślij przypomnienie"}
                                                onClick={() => handleSendReminder(booking.id)}
                                                className={`transition-colors ${booking.reminderSentAt ? 'text-green-500' : 'text-blue-400 hover:text-blue-600'}`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                            <button
                                                title="Usuń rezerwację"
                                                onClick={() => handleDelete(booking.id)}
                                                className="text-gray-300 hover:text-red-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        {bookings.reduce((sum, b) => sum + b.people, 0)}
                    </p>
                </Card>
            </div>
        </div>
    );
}
