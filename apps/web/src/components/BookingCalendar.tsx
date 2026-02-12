'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Input, Select, Card } from '@bolglass/ui';
import { getAvailableSlots, createBooking } from '../app/[locale]/actions';

export default function BookingCalendar() {
    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [people, setPeople] = useState('1');

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSlots() {
            const availableSlots = await getAvailableSlots();
            setSlots(availableSlots);
        }
        fetchSlots();
    }, []);

    // Grouping slots by date
    const groupedSlots = slots.reduce((acc: any, slot: any) => {
        const dateKey = new Date(slot.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(slot);
        return acc;
    }, {});

    const availableDates = Object.keys(groupedSlots).sort((a, b) => {
        return new Date(groupedSlots[a][0].date).getTime() - new Date(groupedSlots[b][0].date).getTime();
    });

    // Scroll to top of calendar when step changes
    useEffect(() => {
        if (step > 1 && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [step]);

    const handleNextStep = () => {
        setStep(2);
    };

    const handleBooking = async () => {
        if (!selectedSlotId || !name || !email) return;

        setLoading(true);
        try {
            const result = await createBooking({
                slotId: selectedSlotId,
                name,
                email,
                people: parseInt(people) || 1
            });
            setLoading(false);
            if (result.success) {
                setStep(3);
            } else {
                alert('Błąd rezerwacji: ' + result.error);
            }
        } catch (err) {
            setLoading(false);
            alert('Wystąpił błąd techniczny. Spróbuj ponownie.');
        }
    };

    const selectedSlot = slots.find(s => s.id === selectedSlotId);

    // Generate people options 1-30
    const peopleOptions = Array.from({ length: 30 }, (_, i) => ({
        label: `${i + 1} ${i === 0 ? 'osoba' : (i < 4 ? 'osoby' : 'osób')}`,
        value: (i + 1).toString()
    }));

    return (
        <section ref={containerRef} className="py-24 bg-white text-black scroll-mt-20">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center text-red-600">
                    Rezerwacja Warsztatów
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Steps Visualizer */}
                    <div className="space-y-4">
                        <div className={`p-4 border rounded-xl transition-all ${step === 1 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <h3 className="font-bold text-lg">1. Wybierz Termin</h3>
                            <p className="text-gray-500 text-sm">Zostań mistrzem dmuchania szkła</p>
                            {selectedSlot && step === 1 && (
                                <div className="mt-2 text-sm text-red-600 font-medium">
                                    Wybrano: {new Date(selectedSlot.date).toLocaleDateString('pl-PL')} o {new Date(selectedSlot.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>
                        <div className={`p-4 border rounded-xl transition-all ${step === 2 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <h3 className="font-bold text-lg">2. Twoje Dane</h3>
                            <p className="text-gray-500 text-sm">Imię i email do potwierdzenia</p>
                        </div>
                        <div className={`p-4 border rounded-xl transition-all ${step === 3 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            <h3 className="font-bold text-lg">3. Gotowe!</h3>
                            <p className="text-gray-500 text-sm">Potwierdzenie wysłane</p>
                        </div>
                    </div>

                    {/* Interactive Area */}
                    <Card className="bg-gray-50 border-2 border-gray-100 shadow-xl p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                {slots.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">Brak dostępnych terminów.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Date Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Wybierz Dzień:</label>
                                            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
                                                {availableDates.map(dateKey => (
                                                    <button
                                                        key={dateKey}
                                                        onClick={() => {
                                                            setSelectedDate(dateKey);
                                                            setSelectedSlotId(null);
                                                        }}
                                                        className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${selectedDate === dateKey ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-transparent bg-white hover:border-red-100'}`}
                                                    >
                                                        {dateKey}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Hour Selection */}
                                        {selectedDate && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Wybierz Godzinę:</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {groupedSlots[selectedDate].map((slot: any) => (
                                                        <button
                                                            key={slot.id}
                                                            onClick={() => setSelectedSlotId(slot.id)}
                                                            className={`p-2 rounded-lg border-2 text-center transition-all text-sm ${selectedSlotId === slot.id ? 'border-red-500 bg-red-600 text-white' : 'border-gray-200 bg-white hover:border-red-300'}`}
                                                        >
                                                            <div className="font-bold">
                                                                {new Date(slot.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className={`text-[10px] ${selectedSlotId === slot.id ? 'text-red-100' : 'text-gray-500'}`}>
                                                                {slot.remainingCapacity} miejsc
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                                    <Button
                                        fullWidth
                                        variant="primary"
                                        size="lg"
                                        disabled={!selectedSlotId}
                                        onClick={handleNextStep}
                                    >
                                        Przejdź do formularza
                                    </Button>
                                    {!selectedSlotId && (
                                        <p className="text-xs text-center text-gray-400 mt-2 italic">
                                            Wybierz dzień i godzinę, aby kontynuować
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
                                    <p className="text-xs text-red-700 font-bold">Wybrany termin:</p>
                                    <p className="text-sm text-red-900">
                                        {selectedDate} o {new Date(selectedSlot?.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <Input
                                    label="Imię i Nazwisko"
                                    className="text-black bg-white border-gray-300"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    className="text-black bg-white border-gray-300"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Select
                                    label="Liczba osób"
                                    className="text-black bg-white border-gray-300"
                                    value={people}
                                    onChange={(e) => setPeople(e.target.value)}
                                    options={peopleOptions}
                                />
                                <Button
                                    fullWidth
                                    variant="primary"
                                    onClick={handleBooking}
                                    disabled={loading || !name || !email}
                                >
                                    {loading ? 'Rezerwowanie...' : 'Zarezerwuj teraz'}
                                </Button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full text-sm text-gray-500 underline text-center block hover:text-black mt-2"
                                >
                                    Wróć do wyboru terminu
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-4 py-8">
                                <div className="text-5xl">🎉</div>
                                <h3 className="text-xl font-bold text-red-600">Rezerwacja Potwierdzona!</h3>
                                <p>Termin: <strong>{selectedDate}</strong> o <strong>{new Date(selectedSlot?.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</strong></p>
                                <p className="text-sm text-gray-600">
                                    Liczba osób: <strong>{people}</strong>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Dziękujemy za rezerwację. Wszystkie szczegóły wysłaliśmy na email: <strong>{email}</strong>
                                </p>
                                <div className="mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setStep(1);
                                            setSelectedSlotId(null);
                                            setSelectedDate(null);
                                            setName('');
                                            setEmail('');
                                            setPeople('1');
                                        }}
                                    >
                                        Wróć do strony głównej
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
