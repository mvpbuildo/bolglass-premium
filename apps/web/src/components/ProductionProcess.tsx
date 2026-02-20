'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ProductionProcess() {
    const t = useTranslations('ProductionProcess');
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const steps = [
        {
            id: 1,
            title: t('step1.title'),
            description: t('step1.desc'),
            color: "from-orange-500 to-red-600",
            image: "/production/heating.png"
        },
        {
            id: 2,
            title: t('step2.title'),
            description: t('step2.desc'),
            color: "from-blue-400 to-cyan-300",
            image: "/production/blowing.png"
        },
        {
            id: 3,
            title: t('step3.title'),
            description: t('step3.desc'),
            color: "from-gray-300 to-gray-100",
            image: "/production/silvering.png"
        },
        {
            id: 4,
            title: t('step4.title'),
            description: t('step4.desc'),
            color: "from-red-600 to-rose-900",
            image: "/production/lacquering.png"
        },
        {
            id: 5,
            title: t('step5.title'),
            description: t('step5.desc'),
            color: "from-purple-500 to-pink-500",
            image: "/production/decorating.png"
        }
    ];

    useEffect(() => {
        const stepDuration = 5000;
        const intervalTime = 50;
        let currentProgress = 0;

        const timer = setInterval(() => {
            currentProgress += (intervalTime / stepDuration) * 100;
            if (currentProgress >= 100) {
                setActiveStep((prev) => (prev + 1) % steps.length);
                currentProgress = 0;
            }
            setProgress(currentProgress);
        }, intervalTime);

        return () => clearInterval(timer);
    }, [activeStep]);

    useEffect(() => {
        setProgress(0);
    }, [activeStep]);

    return (
        <section className="relative min-h-screen py-20 bg-[#050505] text-white flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[#0a0500]" />
            <div className="absolute inset-0 w-full h-full z-0">
                <img
                    src="/production/background.png"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center min-h-[600px]">
                <div className="w-full flex flex-col md:flex-row items-center gap-12">
                    <div className="relative w-full md:w-1/2 aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeStep}
                                src={steps[activeStep].image}
                                alt={steps[activeStep].title}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7 }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        <div className={`absolute inset-0 bg-gradient-to-br ${steps[activeStep].color} opacity-20 mix-blend-overlay z-10`} />
                        <div className="absolute inset-0 border border-white/10 rounded-2xl z-20 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]" />
                    </div>

                    <div className="w-full md:w-1/2 text-left">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h3 className="text-4xl md:text-6xl font-bold mb-8 pb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-600 drop-shadow-sm leading-tight">
                                    {steps[activeStep].title}
                                </h3>
                                <p className="text-xl md:text-2xl text-amber-100/80 leading-relaxed font-light bg-black/40 p-8 rounded-xl backdrop-blur-md border border-amber-500/10">
                                    {steps[activeStep].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex gap-4 mt-16 z-20">
                    {steps.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => setActiveStep(index)}
                            className="group relative h-2 rounded-full overflow-hidden transition-all duration-300"
                            style={{
                                width: activeStep === index ? '4rem' : '1rem',
                                backgroundColor: activeStep === index ? '#451a03' : 'rgba(255,255,255,0.2)'
                            }}
                        >
                            {activeStep === index && (
                                <motion.div
                                    className="absolute inset-0 bg-amber-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ ease: "linear", duration: 0.05 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
