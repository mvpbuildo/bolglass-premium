'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Input, Select, Card } from '@bolglass/ui';
import { getAvailableSlots, createBooking, getSystemSettings, getBookingAvailability } from '../app/[locale]/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function BookingCalendar() {
    const t = useTranslations('Booking');

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [prices, setPrices] = useState({ sightseeing: 35, workshop: 60 });
    const [monthAvailability, setMonthAvailability] = useState<any[]>([]);
    const [daySlots, setDaySlots] = useState<string[]>([]);

    const [bookingType, setBookingType] = useState<'SIGHTSEEING' | 'WORKSHOP'>('SIGHTSEEING');
    const [people, setPeople] = useState('1');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [institutionName, setInstitutionName] = useState('');
    const [institutionAddress, setInstitutionAddress] = useState('');

    useEffect(() => {
        async function init() {
            const [availableSlots, settings] = await Promise.all([
                getAvailableSlots(),
                getSystemSettings()
            ]);
            setMonthAvailability(availableSlots);
            if (settings.price_sightseeing) setPrices(p => ({ ...p, sightseeing: parseInt(settings.price_sightseeing) }));
            if (settings.price_workshop) setPrices(p => ({ ...p, workshop: parseInt(settings.price_workshop) }));
        }
        init();
    }, []);

    useEffect(() => {
        if (step > 0 && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [step]);

    useEffect(() => {
        async function fetchDailySlots() {
            if (!selectedDate) return;
            setLoading(true);
            setDaySlots([]);
            setSelectedTime(null);

            const res = await getBookingAvailability(selectedDate, bookingType, parseInt(people) || 1);
            setLoading(false);

            if (res.success && res.slots) {
                setDaySlots(res.slots);
            } else {
                alert('Error: ' + res.error);
            }
        }

        if (step === 1 && selectedDate) {
            fetchDailySlots();
        }
    }, [selectedDate, step, bookingType, people]);

    const handleBooking = async () => {
        if (!selectedTime || !name || !email) return;

        setLoading(true);
        try {
            const result = await createBooking({
                date: selectedTime,
                name,
                email,
                people: parseInt(people) || 1,
                type: bookingType,
                isGroup,
                institutionName: isGroup ? institutionName : undefined,
                institutionAddress: isGroup ? institutionAddress : undefined
            });
            setLoading(false);
            if (result.success) {
                setStep(3);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err: any) {
            setLoading(false);
            console.error('Client booking error:', err);
            alert('Technical error: ' + (err.message || 'Unknown error'));
        }
    };

    const today = new Date();
    const next30Days = Array.from({ length: 45 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    const currentPrice = bookingType === 'WORKSHOP' ? prices.workshop : prices.sightseeing;

    return (
        <section ref={containerRef} className="py-24 bg-white text-black scroll-mt-20">
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center text-red-600 font-serif">
                    {t('title')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Steps Sidebar */}
                    <div className="md:col-span-4 space-y-4">
                        <StepCard
                            step={0}
                            currentStep={step}
                            label={t('steps.package_people')}
                            setStep={setStep}
                            subText={step > 0 ? `${bookingType === 'WORKSHOP' ? t('step1.workshop_title') : t('step1.sightseeing_title')} (${people} os.)` : ''}
                        />
                        <StepCard
                            step={1}
                            currentStep={step}
                            label={t('steps.date_time')}
                            setStep={setStep}
                            subText={step > 1 && selectedTime ? new Date(selectedTime).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                        />
                        <StepCard
                            step={2}
                            currentStep={step}
                            label={t('steps.details')}
                            setStep={setStep}
                        />
                    </div>

                    {/* Interactive Area */}
                    <div className="md:col-span-8">
                        <Card className="bg-white border border-gray-100 shadow-xl p-8 relative overflow-hidden min-h-[500px]">
                            <AnimatePresence mode="wait">

                                {/* STEP 0: TYPE & PEOPLE */}
                                {step === 0 && (
                                    <motion.div key="step0" {...fadeIn} className="space-y-8">
                                        <h3 className="text-xl font-bold">{t('step1.title')}</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <TypeButton
                                                selected={bookingType === 'SIGHTSEEING'}
                                                onClick={() => setBookingType('SIGHTSEEING')}
                                                icon="👀"
                                                title={t('step1.sightseeing_title')}
                                                desc={t('step1.sightseeing_desc')}
                                                price={prices.sightseeing}
                                                duration="30 min"
                                            />
                                            <TypeButton
                                                selected={bookingType === 'WORKSHOP'}
                                                onClick={() => setBookingType('WORKSHOP')}
                                                icon="🎨"
                                                title={t('step1.workshop_title')}
                                                desc={t('step1.workshop_desc')}
                                                price={prices.workshop}
                                                duration="80 min"
                                                badge={t('step1.recommended')}
                                            />
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                {t('step1.people_label')}
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="92"
                                                    value={people}
                                                    onChange={(e) => setPeople(e.target.value)}
                                                    className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                                />
                                                <div className="w-20 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="92"
                                                        value={people}
                                                        onChange={(e) => setPeople(e.target.value)}
                                                        className="w-full text-center text-xl font-bold border-b-2 border-red-600 bg-transparent focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-center md:text-left text-gray-400 mt-2">
                                                {t('step1.max_capacity')}
                                            </p>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button variant="primary" size="lg" onClick={() => setStep(1)}>
                                                {t('step1.check_dates')} &rarr;
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 1: CALENDAR */}
                                {step === 1 && (
                                    <motion.div key="step1" {...fadeIn} className="space-y-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold">{t('step2.title')}</h3>
                                            <button onClick={() => setStep(0)} className="text-sm text-gray-400 hover:text-red-600 underline">{t('step2.change_params')}</button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
                                            <div className="border-r border-gray-100 pr-4 overflow-y-auto custom-scrollbar">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-white z-10 py-2">{t('step2.available_days')}</p>
                                                <div className="space-y-2">
                                                    {next30Days.map(dateStr => {
                                                        const date = new Date(dateStr);
                                                        const dateLabel = date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
                                                        return (
                                                            <button
                                                                key={dateStr}
                                                                onClick={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                                                                className={`w-full p-3 rounded-lg text-left text-sm transition-all ${selectedDate === dateStr ? 'bg-red-600 text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                                                            >
                                                                {dateLabel}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <div className="overflow-y-auto custom-scrollbar relative">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-white z-10 py-2 relative">
                                                    {selectedDate ? `${t('step2.hours_label')} (${new Date(selectedDate).toLocaleDateString('pl-PL')}):` : t('step2.select_day_placeholder')}
                                                </p>

                                                {loading && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center"><div className="animate-spin text-red-600 text-2xl">⚡</div></div>}

                                                {!selectedDate ? (
                                                    <div className="h-full flex items-center justify-center text-gray-300 italic text-sm border-2 border-dashed border-gray-100 rounded-xl">
                                                        &larr; {t('step2.select_day_placeholder')}
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3 pb-4">
                                                        {daySlots.length === 0 && !loading ? (
                                                            <div className="col-span-2 text-center py-8 text-gray-400 text-xs">
                                                                {t('step2.no_slots')} {people} os.
                                                            </div>
                                                        ) : (
                                                            daySlots.map(timeStr => (
                                                                <button
                                                                    key={timeStr}
                                                                    onClick={() => setSelectedTime(timeStr)}
                                                                    className={`p-3 rounded-xl border text-center transition-all ${selectedTime === timeStr ? 'border-red-600 bg-red-50 text-red-800 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300 hover:bg-red-50'}`}
                                                                >
                                                                    <div className="font-bold text-lg">
                                                                        {new Date(timeStr).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                                            <Button variant="primary" size="lg" disabled={!selectedTime} onClick={() => setStep(2)}>
                                                {t('step2.next')}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2: FORM */}
                                {step === 2 && (
                                    <motion.div key="step2" {...fadeIn} className="space-y-6">
                                        <div className="bg-gradient-to-r from-red-50 to-white p-6 rounded-xl border border-red-100 shadow-sm">
                                            <h4 className="font-bold text-red-900 text-xs uppercase tracking-wider mb-4">{t('step3.summary_title')}</h4>
                                            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500 block text-xs">{t('step3.package')}</span>
                                                    <strong className="text-gray-900 text-lg">{bookingType === 'WORKSHOP' ? t('step1.workshop_title') : t('step1.sightseeing_title')}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block text-xs">{t('step3.date')}</span>
                                                    <strong className="text-gray-900 text-lg">
                                                        {selectedTime && new Date(selectedTime).toLocaleDateString('pl-PL')}
                                                        <span className="mx-2 text-gray-300">|</span>
                                                        {selectedTime && new Date(selectedTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                    </strong>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block text-xs">{t('step3.participants')}</span>
                                                    <strong className="text-gray-900 text-lg">{people} os.</strong>
                                                </div>
                                                <div className="ml-auto text-right">
                                                    <span className="text-gray-500 block text-xs">{t('step3.total_price')}</span>
                                                    <strong className="text-red-600 text-2xl font-black">{currentPrice * parseInt(people)} zł</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label={t('step3.name_label')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('step3.name_placeholder')} />
                                            <Input label={t('step3.email_label')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('step3.email_placeholder')} />
                                        </div>

                                        <div className="border-t border-gray-100 pt-4">
                                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                                <div className={`relative w-12 h-6 rounded-full transition-colors ${isGroup ? 'bg-red-600' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isGroup ? 'translate-x-6' : ''}`} />
                                                    <input type="checkbox" className="sr-only" checked={isGroup} onChange={(e) => setIsGroup(e.target.checked)} />
                                                </div>
                                                <span className="font-bold text-sm text-gray-700 group-hover:text-red-600 transition-colors">{t('step3.group_invoice')}</span>
                                            </label>

                                            <AnimatePresence>
                                                {isGroup && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-4 overflow-hidden">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Input label={t('step3.institution_name')} value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="np. Szkoła Podstawowa nr 1" required={isGroup} />
                                                            <Input label={t('step3.institution_address')} value={institutionAddress} onChange={(e) => setInstitutionAddress(e.target.value)} placeholder="Ulica, Miasto, NIP" required={isGroup} />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button variant="outline" onClick={() => setStep(1)} className="w-1/3">{t('step3.back')}</Button>
                                            <Button variant="primary" onClick={handleBooking} disabled={loading || !name || !email} className="w-2/3">
                                                {loading ? t('step3.processing') : t('step3.confirm')}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-center text-gray-400 mt-2">{t('step3.payment_info')}</p>
                                    </motion.div>
                                )}

                                {/* STEP 3: SUCCESS */}
                                {step === 3 && (
                                    <motion.div key="step3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 shadow-sm">✓</div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('success.title')}</h3>
                                        <p className="text-gray-500 mb-8">{t('success.message', { name })} <strong>{email}</strong>.</p>

                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left max-w-md mx-auto space-y-4 shadow-inner">
                                            <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-2">{t('success.details_title')}</h4>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500 text-sm">{t('step3.date')}:</span>
                                                <span className="font-bold text-gray-900">
                                                    {selectedTime && new Date(selectedTime).toLocaleDateString('pl-PL')}
                                                    <span className="mx-1"> </span>
                                                    {selectedTime && new Date(selectedTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500 text-sm">{t('step3.package')}:</span>
                                                <span className="font-bold text-gray-900">{bookingType === 'WORKSHOP' ? t('step1.workshop_title') : t('step1.sightseeing_title')}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500 text-sm">{t('step3.participants')}:</span>
                                                <span className="font-bold text-gray-900">{people} os.</span>
                                            </div>

                                            {isGroup && (
                                                <div className="border-t border-gray-200 pt-2 mt-2">
                                                    <div className="text-xs font-bold text-red-600 uppercase mb-1">{t('success.invoice_data')}</div>
                                                    <div className="text-sm text-gray-700">{institutionName}</div>
                                                    <div className="text-xs text-gray-500">{institutionAddress}</div>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between items-center">
                                                <span className="text-gray-500 font-medium">{t('step3.total_price')}:</span>
                                                <span className="text-2xl font-black text-red-600">{currentPrice * parseInt(people)} zł</span>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <Button variant="outline" onClick={() => window.location.reload()}>{t('success.back_home')}</Button>
                                        </div>
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

function StepCard({ step, currentStep, label, setStep, subText }: any) {
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;

    return (
        <div
            onClick={() => isCompleted ? setStep(step) : null}
            className={`p-4 border rounded-xl transition-all ${isActive ? 'border-red-500 bg-red-50 shadow-md transform scale-[1.02]' : 'border-gray-100'} ${isCompleted ? 'bg-white opacity-80 hover:opacity-100 cursor-pointer' : 'opacity-60'}`}
        >
            <h3 className="font-bold text-lg flex items-center gap-3">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm ${isActive || isCompleted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isCompleted ? '✓' : step + 1}
                </span>
                <span className={isActive ? 'text-gray-900' : 'text-gray-500'}>{label}</span>
            </h3>
            {subText && <p className="text-xs text-red-600 font-medium mt-1 ml-11">{subText}</p>}
        </div>
    )
}

function TypeButton({ selected, onClick, icon, title, desc, price, duration, badge }: any) {
    return (
        <button
            onClick={onClick}
            className={`relative p-5 rounded-2xl border-2 text-left transition-all h-full flex flex-col ${selected ? 'border-red-600 bg-red-50 shadow-lg scale-[1.02]' : 'border-gray-100 bg-white hover:border-red-200 hover:bg-red-50/30'}`}
        >
            {badge && <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{badge}</div>}
            <div className="text-3xl mb-3">{icon}</div>
            <h4 className="font-bold text-lg mb-1">{title}</h4>
            <div className="text-xs text-gray-500 mb-4 leading-relaxed flex-grow">{desc}</div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200/50 w-full mt-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">{duration}</span>
                <span className="text-lg font-black text-red-600">{price} zł</span>
            </div>
        </button>
    )
}

const fadeIn = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
};
