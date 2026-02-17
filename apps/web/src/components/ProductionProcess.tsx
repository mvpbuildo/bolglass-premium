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
        title: "Dekorowanie (Decorating)",
        description: "Artystki nanoszą wzory z chirurgiczną precyzją. Każde pociągnięcie pędzla to historia.",
        color: "from-purple-500 to-pink-500",
        image: "/production/decorating.png"
    }
];

const ProcessStep = ({ step, index, scrollYProgress }: { step: any, index: number, scrollYProgress: MotionValue<number> }) => {
    const start = index * 0.25;
    const end = start + 0.25;

    // For the first step, we want it visible from the very beginning (progress 0)
    const opacityInput = index === 0
        ? [start, start + 0.15, end]
        : [start, start + 0.1, end - 0.1, end];

    const opacityOutput = index === 0
        ? [1, 1, 0]
        : [0, 1, 1, 0];

    const opacity = useTransform(scrollYProgress, opacityInput, opacityOutput);
    const scale = useTransform(scrollYProgress, [start, start + 0.1, end], [0.8, 1, 0.8]);

    return (
        <motion.div
            style={{ opacity, scale }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
            <div className="flex flex-col md:flex-row items-center gap-12 pointer-events-auto w-full max-w-6xl mx-auto">
                {/* Visual Representation (Left) */}
                <div className="relative w-full md:w-[600px] h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20 mix-blend-overlay z-10`} />
                    <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                    {/* Glass effect border */}
                    <div className="absolute inset-0 border border-white/10 rounded-2xl z-20 pointer-events-none" />
                </div>

                {/* Text Description (Right) */}
                <div className="max-w-md text-center md:text-left z-20">
                    <h3 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
                        {step.title}
                    </h3>
                    <p className="text-xl text-gray-200 leading-relaxed font-light drop-shadow-md bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-white/5">
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
        <section ref={containerRef} className="relative h-[400vh] bg-[#050505] text-white">
            <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
                {/* Background Atmosphere */}
                <div className="absolute inset-0 bg-black/90" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-black to-black opacity-50" />


                {/* Dynamic Process Visualization */}
                <div className="relative z-10 w-full px-8 flex items-center justify-center h-full">
                    {steps.map((step, index) => (
                        <ProcessStep key={step.id} step={step} index={index} scrollYProgress={scrollYProgress} />
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 h-64 w-1 bg-white/5 rounded-full overflow-hidden hidden md:block">
                    <motion.div
                        className="w-full bg-amber-500"
                        style={{ height: scrollYProgress, scaleY: scrollYProgress }}
                    />
                </div>
            </div>
        </section>
    );
}
