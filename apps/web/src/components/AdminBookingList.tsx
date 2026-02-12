'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@bolglass/ui';
import { getAllBookings, deleteBooking } from '../app/[locale]/actions';

export default function AdminBookingList() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        setLoading(true);
        const data = await getAllBookings();
        setBookings(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć tę rezerwację?')) return;

        const result = await deleteBooking(id);
        if (result.success) {
            fetchBookings();
        } else {
            alert('Błąd: ' + result.error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie rezerwacji...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Lista Rezerwacji</h2>
                <Button variant="outline" size="sm" onClick={fetchBookings}>Odśwież</Button>
            </div>

            <Card className="overflow-hidden border-none shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Data i Godzina</th>
                                <th className="px-6 py-4">Imię i Nazwisko</th>
                                <th className="px-6 py-4">Kontakt</th>
                                <th className="px-6 py-4 text-center">Osób</th>
                                <th className="px-6 py-4 text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 italic">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 not-italic">
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
                                        <td className="px-6 py-4 text-gray-700 not-italic">
                                            {booking.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm not-italic">
                                            {booking.email}
                                        </td>
                                        <td className="px-6 py-4 text-center not-italic font-semibold">
                                            {booking.people}
                                        </td>
                                        <td className="px-6 py-4 text-right not-italic">
                                            <button
                                                onClick={() => handleDelete(booking.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium underline px-2 py-1"
                                            >
                                                Usuń
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
