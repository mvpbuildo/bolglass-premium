'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, Card } from '@bolglass/ui';
import { getAvailableSlots, createBooking } from '../app/[locale]/actions';

export default function BookingCalendar() {
    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [people, setPeople] = useState('1');

    useEffect(() => {
        console.log('Client: BookingCalendar Mounted');
        async function fetchSlots() {
            console.log('Client: Fetching slots...');
            const availableSlots = await getAvailableSlots();
            console.log('Client: Slots fetched:', availableSlots);
            setSlots(availableSlots);
        }
        fetchSlots();
    }, []);

    const handleNextStep = () => {
        console.log('Client: Moving to Step 2. Selected Slot ID:', selectedSlotId);
        setStep(2);
    };

    const handleBooking = async () => {
        console.log('Client: handleBooking CLICKED', { selectedSlotId, name, email, people });

        if (!selectedSlotId) {
            console.error('Client: No slot selected!');
            alert('Wybierz termin!');
            return;
        }

        if (!name || !email) {
            console.error('Client: Missing name or email');
            alert('Wypełnij wszystkie pola!');
            return;
        }

        setLoading(true);
        try {
            console.log('Client: Calling createBooking Server Action...');
            const result = await createBooking({
                slotId: selectedSlotId,
                name,
                email,
                people: parseInt(people) || 1
            });
            console.log('Client: Server Action result:', result);
            setLoading(false);
            if (result.success) {
                setStep(3);
            } else {
                alert('Błąd rezerwacji: ' + result.error);
            }
        } catch (err) {
            console.error('Client: CRITICAL ERROR calling server action:', err);
            setLoading(false);
            alert('Wystąpił błąd techniczny. Sprawdź konsolę.');
        }
    };

    const selectedSlot = slots.find(s => s.id === selectedSlotId);

    return (
        <section className="py-24 bg-white text-black">
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
                                    <div className="grid grid-cols-1 gap-4">
                                        {slots.map(slot => (
                                            <button
                                                key={slot.id}
                                                onClick={() => {
                                                    console.log('Client: Selected Slot:', slot.id);
                                                    setSelectedSlotId(slot.id);
                                                }}
                                                className={`p-5 rounded-xl border-2 text-left transition-all ${selectedSlotId === slot.id ? 'border-red-500 bg-red-50' : 'border-transparent bg-white hover:border-red-100'}`}
                                            >
                                                <div className="font-bold text-lg">
                                                    {new Date(slot.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Dostępne miejsca: <span className="font-bold text-black">{slot.capacity - slot._count.bookings}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-8 pt-4 border-t border-gray-200">
                                    <Button
                                        fullWidth
                                        variant="primary"
                                        size="lg"
                                        disabled={!selectedSlotId}
                                        onClick={handleNextStep}
                                        className="shadow-xl"
                                    >
                                        Przejdź do formularza
                                    </Button>
                                    {!selectedSlotId && (
                                        <p className="text-xs text-center text-gray-400 mt-2 italic">
                                            Wybierz termin powyżej, aby kontynuować
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <Input
                                    label="Imię i Nazwisko"
                                    className="text-black bg-white border-gray-300"
                                    value={name}
                                    onChange={(e) => {
                                        console.log('Client: Name updated:', e.target.value);
                                        setName(e.target.value);
                                    }}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    className="text-black bg-white border-gray-300"
                                    value={email}
                                    onChange={(e) => {
                                        console.log('Client: Email updated:', e.target.value);
                                        setEmail(e.target.value);
                                    }}
                                />
                                <Select
                                    label="Liczba osób"
                                    className="text-black bg-white border-gray-300"
                                    value={people}
                                    onChange={(e) => setPeople(e.target.value)}
                                    options={[
                                        { label: '1 osoba', value: '1' },
                                        { label: '2 osoby', value: '2' },
                                        { label: '3 osoby', value: '3' },
                                        { label: '4 osoby', value: '4' }
                                    ]}
                                />
                                <Button
                                    fullWidth
                                    variant="primary"
                                    onClick={handleBooking}
                                    disabled={loading}
                                >
                                    {loading ? 'Rezerwowanie...' : 'Zarezerwuj teraz'}
                                </Button>
                                <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 underline text-center block hover:text-black">
                                    Wróć do wyboru daty
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-4 py-8">
                                <div className="text-5xl">🎉</div>
                                <h3 className="text-xl font-bold text-red-600">Rezerwacja Potwierdzona!</h3>
                                <p>Termin: <strong>{new Date(selectedSlot?.date).toLocaleDateString()}</strong></p>
                                <p className="text-sm text-gray-600">
                                    Dziękujemy za rezerwację. Wszystkie szczegóły wysłaliśmy na email: <strong>{email}</strong>
                                </p>
                                <div className="mt-6">
                                    <Button variant="outline" onClick={() => {
                                        setStep(1);
                                        setSelectedSlotId(null);
                                        setName('');
                                        setEmail('');
                                    }} size="sm">
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
