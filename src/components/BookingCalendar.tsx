'use client';

import { useState } from 'react';
// import { useTranslations } from 'next-intl';

export default function BookingCalendar() {
    // Mock translations for now since we haven't added them to JSON yet
    // In real app, useTranslations('Booking')
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [step, setStep] = useState(1);

    const dates = [
        '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-15'
    ];

    return (
        <section className="py-24 bg-white text-black">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center text-red-600">
                    Rezerwacja Warsztatów (Booking)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Steps Visualizer */}
                    <div className="space-y-4">
                        <div className={`p-4 border rounded-xl transition-all ${step === 1 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <h3 className="font-bold text-lg">1. Wybierz Termin</h3>
                            <p className="text-gray-500 text-sm">Dostępne daty na luty 2026</p>
                        </div>
                        <div className={`p-4 border rounded-xl transition-all ${step === 2 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <h3 className="font-bold text-lg">2. Twoje Dane</h3>
                            <p className="text-gray-500 text-sm">Imię, nazwisko i liczba osób</p>
                        </div>
                        <div className={`p-4 border rounded-xl transition-all ${step === 3 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <h3 className="font-bold text-lg">3. Podsumowanie</h3>
                            <p className="text-gray-500 text-sm">Potwierdzenie i płatność</p>
                        </div>
                    </div>

                    {/* Interactive Area */}
                    <div className="bg-gray-50 p-8 rounded-2xl shadow-lg h-96 overflow-y-auto">
                        {step === 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                {dates.map(date => (
                                    <button
                                        key={date}
                                        onClick={() => setSelectedDate(date)}
                                        className={`p-4 rounded-lg border-2 transition-all ${selectedDate === date ? 'border-red-500 bg-red-100' : 'border-transparent bg-white hover:border-red-200'}`}
                                    >
                                        {date}
                                    </button>
                                ))}
                                <button
                                    disabled={!selectedDate}
                                    onClick={() => setStep(2)}
                                    className="col-span-2 mt-4 w-full py-3 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
                                >
                                    Dalej
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <input type="text" placeholder="Imię i Nazwisko" className="w-full p-3 border rounded-lg" />
                                <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" />
                                <select aria-label="Liczba osób" className="w-full p-3 border rounded-lg">
                                    <option>1 osoba</option>
                                    <option>2 osoby</option>
                                    <option>Grupa (3-10)</option>
                                </select>
                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                    Podsumowanie
                                </button>
                                <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 underline">Wróć</button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-4">
                                <div className="text-5xl">🎉</div>
                                <h3 className="text-xl font-bold">Gotowe!</h3>
                                <p>Wybrany termin: <strong>{selectedDate}</strong></p>
                                <p>Na Twój email wysłaliśmy link do płatności.</p>
                                <button onClick={() => setStep(1)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full">Zarezerwuj kolejny</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
