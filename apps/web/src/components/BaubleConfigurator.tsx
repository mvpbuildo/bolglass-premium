'use client';

import { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

function Bauble({ color, text }: { color: string, text: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Rotate the bauble slowly
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group dispose={null}>
            <mesh ref={meshRef} castShadow receiveShadow>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.9}
                    roughness={0.1}
                    envMapIntensity={1}
                />
                {/* Text Decal */}
                {text && (
                    <Text
                        position={[0, 0, 1.01]} // Closer to surface
                        fontSize={0.15} // Smaller to fit curvature
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.015}
                        outlineColor="#d4af37"
                    >
                        {text}
                    </Text>
                )}

                {/* Placeholder for "Cap" (Zatyczka) */}
                <mesh position={[0, 1.1, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
                    <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.2} />
                </mesh>
                <mesh position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <torusGeometry args={[0.1, 0.02, 16, 100]} />
                    <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.2} />
                </mesh>
            </mesh>
        </group>
    );
}

export default function BaubleConfigurator() {
    const [color, setColor] = useState('#D91A1A'); // Bolglass Red
    const [text, setText] = useState('');

    const colors = ['#D91A1A', '#1E40AF', '#047857', '#F59E0B', '#FCD34D', '#9333EA'];

    return (
        <section className="py-24 bg-neutral-950 text-white relative overflow-hidden">
            {/* UI Overlay */}
            <div className="absolute top-10 left-10 z-10 max-w-sm pointer-events-none">
                <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500">
                    Studio Projektowe
                </h2>
                <p className="mt-4 text-gray-400">
                    Stwórz własną, unikalną bombkę. Wybierz kolor, dodaj dedykację i zamów prosto z fabryki.
                </p>
            </div>

            {/* Configuration Controls */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-2xl z-10 w-80 border border-white/20">
                <h3 className="text-xl font-bold mb-6">Konfiguracja</h3>

                <div className="mb-8">
                    <label className="text-sm text-gray-400 block mb-3">Kolor Bazy</label>
                    <div className="flex flex-wrap gap-3">
                        {colors.map(c => (
                            <button
                                key={c}
                                aria-label={`Wybierz kolor ${c}`}
                                onClick={() => setColor(c)}
                                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <label className="text-sm text-gray-400 block mb-3">Twój Napis</label>
                    <input
                        type="text"
                        maxLength={20}
                        placeholder="Np. Wesołych Świąt"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                    />
                </div>

                <button className="w-full py-4 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/50">
                    Dodaj do Koszyka (120 PLN)
                </button>
            </div>

            {/* 3D Canvas */}
            <div className="w-full h-[800px] cursor-grab active:cursor-grabbing">
                <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
                    <Suspense fallback={null}>
                        <Environment preset="studio" />

                        {/* Lights */}
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />

                        {/* The Bauble */}
                        <Bauble color={color} text={text} />

                        {/* Floor Reflection/Shadow */}
                        <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />

                        {/* User Interactions */}
                        <OrbitControls
                            enablePan={false}
                            enableZoom={false}
                            minPolarAngle={Math.PI / 4}
                            maxPolarAngle={Math.PI / 1.5}
                        />
                    </Suspense>
                </Canvas>
            </div>
        </section>
    );
}
