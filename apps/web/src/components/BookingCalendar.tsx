'use client';

import { useState } from 'react';
import { Button, Input, Select, Card } from '@bolglass/ui';

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
                    <Card className="h-96 overflow-y-auto bg-gray-50 dark:bg-gray-50 border-none shadow-lg">
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
                                <div className="col-span-2 mt-4">
                                    <Button
                                        fullWidth
                                        variant="secondary"
                                        disabled={!selectedDate}
                                        onClick={() => setStep(2)}
                                    >
                                        Dalej
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <Input placeholder="Imię i Nazwisko" className="text-black bg-white border-gray-300" />
                                <Input placeholder="Email" type="email" className="text-black bg-white border-gray-300" />
                                <Select
                                    className="text-black bg-white border-gray-300"
                                    options={[
                                        { label: '1 osoba', value: '1' },
                                        { label: '2 osoby', value: '2' },
                                        { label: 'Grupa (3-10)', value: 'group' }
                                    ]}
                                />
                                <Button fullWidth variant="secondary" onClick={() => setStep(3)}>
                                    Podsumowanie
                                </Button>
                                <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 underline text-center block hover:text-black">
                                    Wróć
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-4">
                                <div className="text-5xl">🎉</div>
                                <h3 className="text-xl font-bold">Gotowe!</h3>
                                <p>Wybrany termin: <strong>{selectedDate}</strong></p>
                                <p>Na Twój email wysłaliśmy link do płatności.</p>
                                <div className="mt-6">
                                    <Button variant="primary" onClick={() => setStep(1)} size="sm" className="rounded-full">
                                        Zarezerwuj kolejny
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </section>
    );
}
