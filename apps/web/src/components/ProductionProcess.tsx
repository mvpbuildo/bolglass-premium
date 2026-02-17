'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const steps = [
    {
        id: 1,
        title: "Ogrzewanie (Heating)",
        description: "Szkło ogrzewane jest do czerwoności, stając się plastycznym materiałem gotowym na magię.",
        color: "from-orange-500 to-red-600",
        image: "/production/heating.png"
    },
    {
        id: 2,
        title: "Dmuchanie (Blowing)",
        description: "Mistrz dmuchacz jednym tchem nadaje kształt. Tak rodzi się dusza bombki.",
        color: "from-blue-400 to-cyan-300",
        image: "/production/blowing.png"
    },
    {
        id: 3,
        title: "Srebrzenie (Silvering)",
        description: "Wnętrze wypełniane jest azotanem srebra. Bombka zyskuje swoje lustrzane serce.",
        color: "from-gray-300 to-gray-100",
        image: "/production/silvering.png"
    },
    {
        id: 4,
        title: "Lakierowanie (Lacquering)",
        description: "Po srebrzeniu bombki są lakierowane, aby nadać im niepowtarzalne kolory.",
        color: "from-red-600 to-rose-900", // Adapted for lacquering/coloring vibe
        image: "/production/lacquering.png"
    },
    {
        id: 5,
        title: "Dekorowanie (Decorating)",
        description: "Artystki nanoszą wzory z chirurgiczną precyzją. Każde pociągnięcie pędzla to historia.",
        color: "from-purple-500 to-pink-500",
        image: "/production/decorating.png"
    }
];

const ProcessStep = ({ step, index, scrollYProgress }: { step: any, index: number, scrollYProgress: MotionValue<number> }) => {
    // Optimized timing for 5 steps to ensure complete visibility
    // Total range: 0 to 1
    // Step duration: 0.2 (20%) - 5 steps fit perfectly
    // Overlap: 0.05 (5%) to ensure no black gaps

    const stepCount = 5;
    const stepDuration = 1 / stepCount; // 0.2
    const overlap = 0.05;

    // Start times: 0.0, 0.2, 0.4, 0.6, 0.8
    // End times:   0.2, 0.4, 0.6, 0.8, 1.0 (with overlap)
    const start = index * (stepDuration - (overlap / 2)); // Slightly adjusting start for overlap
    // Simple linear distribution might be better for 5 steps to avoid complexity
    // Let's use simple logic:
    // 0: 0.0 - 0.25
    // 1: 0.2 - 0.45
    // 2: 0.4 - 0.65
    // 3: 0.6 - 0.85
    // 4: 0.8 - 1.0

    const simpleStart = index * 0.2;
    const end = simpleStart + 0.25;

    // Fade in/out logic
    let opacityInput = [simpleStart, simpleStart + 0.05, end - 0.05, end];
    let opacityOutput = [0, 1, 1, 0];

    const isLast = index === stepCount - 1;
    if (isLast) {
        // Last step stays visible until the end
        opacityInput = [simpleStart, simpleStart + 0.05, 1];
        opacityOutput = [0, 1, 1];
    }

    // Scale effect
    const scaleInput = [simpleStart, simpleStart + 0.1, end];
    const scaleOutput = [0.9, 1, 0.9];

    const opacity = useTransform(scrollYProgress, opacityInput, opacityOutput);
    const scale = useTransform(scrollYProgress, scaleInput, scaleOutput);

    return (
        <motion.div
            style={{ opacity, scale }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
            <div className="flex flex-col md:flex-row items-center gap-12 pointer-events-auto w-full max-w-6xl mx-auto px-4">
                {/* Visual Representation (Left) */}
                <div className="relative w-full md:w-[600px] h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20 mix-blend-overlay z-10`} />
                    <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Glass effect border */}
                    <div className="absolute inset-0 border border-white/10 rounded-2xl z-20 pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />
                </div>

                {/* Text Description (Right) */}
                <div className="max-w-md text-center md:text-left z-20">
                    <h3 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-600 drop-shadow-sm">
                        {step.title}
                    </h3>
                    <p className="text-xl text-amber-100/80 leading-relaxed font-light drop-shadow-md bg-black/40 p-6 rounded-xl backdrop-blur-md border border-amber-500/10">
                        {step.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default function ProductionProcess() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={containerRef} className="relative h-[600vh] bg-[#050505] text-white">
            <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
                {/* Background Atmosphere - Bolglass Premium Theme */}
                <div className="absolute inset-0 bg-[#0a0500]" />
                <div className="relative w-full h-full">
                    <img
                        src="/production/background.png"
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
                </div>


                {/* Dynamic Process Visualization */}
                <div className="relative z-10 w-full px-8 flex items-center justify-center h-full">
                    {steps.map((step, index) => (
                        <ProcessStep key={step.id} step={step} index={index} scrollYProgress={scrollYProgress} />
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 h-64 w-1 bg-white/5 rounded-full overflow-hidden hidden md:block">
                    <motion.div
                        className="w-full bg-gradient-to-b from-amber-300 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        style={{ height: scrollYProgress, scaleY: scrollYProgress }}
                    />
                </div>
            </div>
        </section>
    );
}
