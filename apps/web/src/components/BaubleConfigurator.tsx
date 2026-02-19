'use client';

import { Suspense, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Center, Float, Decal, RenderTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Button, Input, Card } from '@bolglass/ui';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

function Bauble({ color, text }: { color: string, text: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

    // Rotate the bauble slowly
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group dispose={null}>
            {/* Glass Bauble */}
            <mesh ref={meshRef} castShadow receiveShadow>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhysicalMaterial
                    ref={materialRef}
                    color={color}
                    metalness={0.1}
                    roughness={0.05}
                    transmission={0.9} // Glass-like transmission
                    thickness={0.1} // Refraction thickness
                    clearcoat={1}
                    clearcoatRoughness={0}
                    envMapIntensity={1.5}
                />

                {/* Text Decal - "Printed" on surface */}
                {text && (
                    <Decal
                        position={[0, 0, 1]}
                        rotation={[0, 0, 0]}
                        scale={[0.8, 0.4, 0.8]}
                    >
                        <meshStandardMaterial
                            transparent
                            polygonOffset
                            polygonOffsetFactor={-1}
                            roughness={0.5}
                            metalness={0.8}
                            color="#d4af37" // Gold text
                        >
                            <RenderTexture attach="map">
                                <PerspectiveCamera makeDefault manual aspect={2 / 1} position={[0, 0, 5]} />
                                <color attach="background" args={['#00000000']} />
                                <Text
                                    fontSize={1.5}
                                    color="#d4af37"
                                    anchorX="center"
                                    anchorY="middle"
                                >
                                    {text}
                                </Text>
                            </RenderTexture>
                        </meshStandardMaterial>
                    </Decal>
                )}

                {/* Detailed Cap (Zatyczka) */}
                <group position={[0, 1.0, 0]}>
                    {/* Metal Cap Base */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.15, 0.15, 0.15, 32, 1, true]} />
                        <meshStandardMaterial
                            color="#C0C0C0"
                            metalness={1}
                            roughness={0.3}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    {/* Crinkled edges (illusion with torus knots or texture - keeping simple for now but detailed) */}
                    <mesh position={[0, 0.08, 0]}>
                        <cylinderGeometry args={[0.12, 0.15, 0.05, 32]} />
                        <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.3} />
                    </mesh>

                    {/* Wire Loop */}
                    <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.08, 0.015, 16, 32]} />
                        <meshStandardMaterial color="#A0A0A0" metalness={1} roughness={0.2} />
                    </mesh>
                </group>
            </mesh>

            {/* Inner "Glitter" or fill illusion (optional, for opaque look inside glass) */}
            <mesh scale={[0.98, 0.98, 0.98]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.5}
                    roughness={0.8}
                    side={THREE.BackSide} // Render inside
                />
            </mesh>
        </group>
    );
}

export default function BaubleConfigurator() {
    const [color, setColor] = useState('#D91A1A'); // Bolglass Red
    const [text, setText] = useState('');
    const { addItem } = useCart();

    const colors = [
        { hex: '#D91A1A', name: 'Czerwień Królewska', price: 0 },
        { hex: '#1E40AF', name: 'Głębia Oceanu', price: 0 },
        { hex: '#047857', name: 'Szmaragdowy Las', price: 0 },
        { hex: '#F59E0B', name: 'Złoty Bursztyn', price: 5 }, // Premium
        { hex: '#FCD34D', name: 'Jasne Złoto', price: 5 }, // Premium
        { hex: '#9333EA', name: 'Purpura Władców', price: 5 } // Premium
    ];

    // Pricing Logic
    const basePrice = 29.99;
    const colorPrice = colors.find(c => c.hex === color)?.price || 0;
    const textPrice = text.length > 0 ? 10 : 0;
    const totalPrice = basePrice + colorPrice + textPrice;

    const handleAddToCart = () => {
        addItem({
            id: `config-${Date.now()}`,
            name: `Bombka Personalizowana (${colors.find(c => c.hex === color)?.name})`,
            price: totalPrice,
            slug: 'bombka-personalizowana',
            quantity: 1,
            // image: TODO: Capture canvas as image? For now using generic placeholder
            image: '/bauble-placeholder.png'
        });
        toast.success('Dodano spersonalizowaną bombkę do koszyka!');
    };

    return (
        <section className="h-[90vh] w-full bg-neutral-950 text-white relative flex flex-col md:flex-row overflow-hidden">
            {/* Left Panel - UI */}
            <div className="w-full md:w-1/3 min-w-[350px] bg-neutral-900/80 backdrop-blur-md p-8 flex flex-col justify-center z-10 border-r border-white/5 overflow-y-auto">
                <div className="mb-10">
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
                        Kreator Ozdób
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Zaprojektuj unikalną ozdobę choinkową. Wybierz szkło, kolor i dodaj osobistą dedykację.
                    </p>
                </div>

                <div className="space-y-8 flex-grow">
                    {/* Color Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                            Wybierz Kolor Szkła
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {colors.map(c => (
                                <button
                                    key={c.hex}
                                    onClick={() => setColor(c.hex)}
                                    className={`relative aspect-square rounded-xl border-2 transition-all duration-300 group overflow-hidden ${color === c.hex ? 'border-amber-500 ring-2 ring-amber-500/20 scale-105' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    <div className="absolute inset-0" style={{ backgroundColor: c.hex }} />
                                    {/* Glass Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {c.price > 0 && (
                                        <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-black/50 px-1.5 py-0.5 rounded text-amber-500">
                                            +{c.price} zł
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-sm text-gray-300 font-medium">
                            {colors.find(c => c.hex === color)?.name}
                        </p>
                    </div>

                    {/* Text Input */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                            Twoja Dedykacja <span className="text-amber-500">(+10 PLN)</span>
                        </label>
                        <Input
                            placeholder="Np. Dla Babci Zosi"
                            maxLength={15}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="bg-black/50 border-white/10 focus:border-amber-500 text-white"
                        />
                        <p className="text-xs text-gray-500 mt-2 text-right">
                            {text.length}/15 znaków
                        </p>
                    </div>
                </div>

                {/* Summary & Action */}
                <div className="pt-6 border-t border-white/10 mt-6">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-sm text-gray-400">Cena całkowita</span>
                        <span className="text-3xl font-bold text-white">{totalPrice.toFixed(2)} zł</span>
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={handleAddToCart}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-900/20"
                    >
                        DODAJ DO KOSZYKA
                    </Button>
                </div>
            </div>

            {/* Right Panel - 3D Canvas */}
            <div className="flex-grow h-[50vh] md:h-full relative bg-gradient-to-b from-neutral-800 to-neutral-950 cursor-grab active:cursor-grabbing">
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <Suspense fallback={null}>
                        {/* Studio Lighting Environment */}
                        <Environment preset="studio" blur={1} background={false} />

                        {/* Additional Lights for Glass Sparkle */}
                        <ambientLight intensity={0.2} />
                        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#blue" />

                        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                            <Bauble color={color} text={text} />
                        </Float>

                        <ContactShadows position={[0, -1.6, 0]} opacity={0.5} scale={10} blur={2} far={4} color="#000000" />

                        <OrbitControls
                            enablePan={false}
                            minPolarAngle={Math.PI / 4}
                            maxPolarAngle={Math.PI / 1.5}
                            minDistance={3}
                            maxDistance={8}
                        />
                    </Suspense>
                </Canvas>

                {/* 3D Label */}
                <div className="absolute top-6 right-6 px-4 py-2 bg-black/30 backdrop-blur rounded-full border border-white/10 pointer-events-none">
                    <span className="text-xs font-bold text-white/50 tracking-widest uppercase">Podgląd 3D na żywo</span>
                </div>
            </div>
        </section>
    );
}
