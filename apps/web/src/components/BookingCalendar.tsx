'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Input, Select, Card } from '@bolglass/ui';
import { getAvailableSlots, createBooking, getSystemSettings } from '../app/[locale]/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingCalendar() {
    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [step, setStep] = useState(0); // 0: Type Selection, 1: Date, 2: Form, 3: Success
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Settings / Pricing
    const [prices, setPrices] = useState({ sightseeing: 35, workshop: 60 });
    const [bookingType, setBookingType] = useState<'SIGHTSEEING' | 'WORKSHOP'>('SIGHTSEEING');

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [people, setPeople] = useState('1');

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            const [availableSlots, settings] = await Promise.all([
                getAvailableSlots(),
                getSystemSettings()
            ]);
            setSlots(availableSlots);

            if (settings.price_sightseeing) setPrices(p => ({ ...p, sightseeing: parseInt(settings.price_sightseeing) }));
            if (settings.price_workshop) setPrices(p => ({ ...p, workshop: parseInt(settings.price_workshop) }));
        }
        init();
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
        if (step > 0 && containerRef.current) {
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
                people: parseInt(people) || 1,
                type: bookingType
            });
            setLoading(false);
            if (result.success) {
                setStep(3);
            } else {
                alert('Błąd rezerwacji: ' + result.error);
            }
        } catch (err: any) {
            setLoading(false);
            console.error('Client booking error:', err);
            alert('Wystąpił błąd techniczny: ' + (err.message || 'Nieznany błąd'));
        }
    };

    const selectedSlot = slots.find(s => s.id === selectedSlotId);

    // Generate people options based on selected slot capacity
    const selectedSlotData = slots.find(s => s.id === selectedSlotId);
    const maxPeople = selectedSlotData ? selectedSlotData.remainingCapacity : 10;

    const peopleOptions = Array.from({ length: Math.min(30, maxPeople) }, (_, i) => ({
        label: `${i + 1} ${i === 0 ? 'osoba' : (i < 4 ? 'osoby' : 'osób')}`,
        value: (i + 1).toString()
    }));

    const currentPrice = bookingType === 'WORKSHOP' ? prices.workshop : prices.sightseeing;
    const currentDuration = bookingType === 'WORKSHOP' ? 'ok. 80 min' : 'ok. 30 min';

    return (
        <section ref={containerRef} className="py-24 bg-white text-black scroll-mt-20">
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center text-red-600 font-serif">
                    Rezerwacja online
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Steps Visualizer - Sidebar */}
                    <div className="md:col-span-4 space-y-4">
                        <div
                            className={`p-4 border rounded-xl transition-all cursor-pointer ${step === 0 ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-100 opacity-60'}`}
                            onClick={() => setStep(0)}
                        >
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs">1</span>
                                Wybierz Pakiet
                            </h3>
                            {step > 0 && (
                                <p className="text-red-600 text-sm font-medium mt-1 ml-8">
                                    {bookingType === 'WORKSHOP' ? 'Warsztaty' : 'Zwiedzanie'}
                                </p>
                            )}
                        </div>

                        <div className={`p-4 border rounded-xl transition-all ${step === 1 ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-100 opacity-60'}`}>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs">2</span>
                                Termin
                            </h3>
                            {selectedSlot && step > 1 && (
                                <div className="mt-1 ml-8 text-sm text-gray-600">
                                    {new Date(selectedSlot.date).toLocaleDateString('pl-PL')} <br />
                                    godz. {new Date(selectedSlot.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>

                        <div className={`p-4 border rounded-xl transition-all ${step === 2 ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-100 opacity-60'}`}>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs">3</span>
                                Dane
                            </h3>
                        </div>
                    </div>

                    {/* Interactive Area */}
                    <div className="md:col-span-8">
                        <Card className="bg-white border border-gray-100 shadow-2xl p-8 relative overflow-hidden min-h-[400px]">
                            <AnimatePresence mode="wait">

                                {/* STEP 0: PACKAGE SELECTION */}
                                {step === 0 && (
                                    <motion.div
                                        key="step0"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-bold mb-6">Na co masz ochotę?</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => { setBookingType('SIGHTSEEING'); setStep(1); }}
                                                className="group relative p-6 border-2 border-gray-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all text-left flex flex-col h-full"
                                            >
                                                <div className="text-2xl mb-2">👀</div>
                                                <h4 className="font-bold text-lg mb-1">Zwiedzanie Fabryki</h4>
                                                <p className="text-sm text-gray-500 mb-4 flex-grow">
                                                    Zobacz proces dmuchania szkła z przewodnikiem. Otrzymasz bombkę imienną lub zestaw 6 bombek.
                                                </p>
                                                <div className="mt-auto pt-4 border-t border-gray-200 w-full flex justify-between items-center group-hover:border-red-200">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">30 min</span>
                                                    <span className="text-xl font-bold text-red-600">{prices.sightseeing} zł</span>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => { setBookingType('WORKSHOP'); setStep(1); }}
                                                className="group relative p-6 border-2 border-red-100 rounded-2xl bg-gradient-to-br from-white to-red-50/30 hover:border-red-600 hover:shadow-lg transition-all text-left flex flex-col h-full"
                                            >
                                                <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">Polecane</div>
                                                <div className="text-2xl mb-2">🎨</div>
                                                <h4 className="font-bold text-lg mb-1">Zwiedzanie + Warsztaty</h4>
                                                <p className="text-sm text-gray-500 mb-4 flex-grow">
                                                    Wszystko co w zwiedzaniu + <strong>własnoręczne malowanie 2 bombek</strong> pod okiem artysty.
                                                </p>
                                                <div className="mt-auto pt-4 border-t border-gray-200 w-full flex justify-between items-center group-hover:border-red-200">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">80 min</span>
                                                    <span className="text-xl font-bold text-red-600">{prices.workshop} zł</span>
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 1: DATE SELECTION */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold">Wybierz Termin</h3>
                                            <button onClick={() => setStep(0)} className="text-sm text-gray-400 hover:text-red-600 underline">Zmień pakiet</button>
                                        </div>

                                        {slots.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                                <p className="text-gray-500">Brak wolnych terminów w tym miesiącu.</p>
                                                <p className="text-sm text-gray-400 mt-2">Zadzwoń do nas, aby zapytać o grupy indywidualne.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Date List */}
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {availableDates.map(dateKey => (
                                                        <button
                                                            key={dateKey}
                                                            onClick={() => {
                                                                setSelectedDate(dateKey);
                                                                setSelectedSlotId(null);
                                                            }}
                                                            className={`w-full p-4 rounded-xl border text-left transition-all ${selectedDate === dateKey ? 'border-red-500 bg-red-600 text-white shadow-lg transform scale-[1.02]' : 'border-gray-100 bg-white hover:border-red-200 hover:bg-red-50'}`}
                                                        >
                                                            <span className="font-bold block">{dateKey.split(',')[0]}</span>
                                                            <span className="text-sm opacity-80">{dateKey.split(',').slice(1).join(',')}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Hours List */}
                                                <div>
                                                    {selectedDate ? (
                                                        <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                                            <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Dostępne godziny:</p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {groupedSlots[selectedDate].map((slot: any) => (
                                                                    <button
                                                                        key={slot.id}
                                                                        onClick={() => setSelectedSlotId(slot.id)}
                                                                        className={`p-3 rounded-lg border-2 text-center transition-all relative ${selectedSlotId === slot.id ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 bg-white hover:border-red-200'}`}
                                                                    >
                                                                        <div className="font-bold text-lg">
                                                                            {new Date(slot.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400 mt-1">
                                                                            {slot.remainingCapacity} miejsc
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-gray-300 text-sm italic border-2 border-dashed border-gray-100 rounded-xl">
                                                            &larr; Wybierz dzień z listy
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                disabled={!selectedSlotId}
                                                onClick={handleNextStep}
                                            >
                                                Dalej
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2: FORM */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-gradient-to-r from-red-50 to-white p-6 rounded-xl border border-red-100">
                                            <h4 className="font-bold text-red-800 text-sm uppercase tracking-wider mb-2">Podsumowanie</h4>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-lg font-bold text-black">{bookingType === 'WORKSHOP' ? 'Warsztaty' : 'Zwiedzanie'}</p>
                                                    <p className="text-gray-600">
                                                        {selectedDate} godz. {new Date(selectedSlot?.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-red-600">{currentPrice} zł</div>
                                                    <div className="text-xs text-gray-400">za osobę</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Input
                                                label="Imię i Nazwisko"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="np. Jan Kowalski"
                                            />
                                            <Input
                                                label="Adres Email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="jan@example.com"
                                            />
                                            <Select
                                                label="Liczba osób"
                                                value={people}
                                                onChange={(e) => setPeople(e.target.value)}
                                                options={peopleOptions}
                                            />
                                        </div>

                                        <div className="pt-6 flex gap-4">
                                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                                Wróć
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={handleBooking}
                                                disabled={loading || !name || !email}
                                                className="flex-[2]"
                                            >
                                                {loading ? 'Rezerwowanie...' : `Rezerwuję z obowiązkiem zapłaty (${currentPrice * (parseInt(people) || 1)} zł)`}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-center text-gray-400">
                                            Płatność na miejscu lub przelewem (otrzymasz dane w mailu).
                                        </p>
                                    </motion.div>
                                )}

                                {/* STEP 3: SUCCESS */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12 space-y-6"
                                    >
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">
                                            ✓
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">Rezerwacja przyjęta!</h3>
                                        <p className="text-gray-600 max-w-md mx-auto">
                                            Dziękujemy <strong>{name}</strong>! Potwierdzenie wysłaliśmy na <strong>{email}</strong>.
                                        </p>
                                        <div className="bg-gray-50 p-6 rounded-xl max-w-sm mx-auto text-left space-y-2 border border-dashed border-gray-200">
                                            <p className="flex justify-between"><span>Typ:</span> <strong>{bookingType === 'WORKSHOP' ? 'Warsztaty' : 'Zwiedzanie'}</strong></p>
                                            <p className="flex justify-between"><span>Termin:</span> <strong>{selectedDate}</strong></p>
                                            <p className="flex justify-between"><span>Do zapłaty:</span> <strong className="text-red-600">{currentPrice * parseInt(people)} zł</strong></p>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.reload()}
                                        >
                                            Wróć do strony głównej
                                        </Button>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
