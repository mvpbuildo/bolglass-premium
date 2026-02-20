'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Float, Decal, RenderTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Button, Input } from '@bolglass/ui';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { getConfiguratorSettings, type BaubleConfig } from '@/app/[locale]/admin/settings/3d/actions';
import { calculateBaublePrice } from '@/services/pricing';


function Bauble({ color, text, scale, isCapturing }: { color: string, text: string, scale: number, isCapturing?: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

    // Rotate the bauble slowly
    useFrame((state, delta) => {
        if (meshRef.current && !isCapturing) {
            meshRef.current.rotation.y += delta * 0.1;
        } else if (meshRef.current && isCapturing) {
            meshRef.current.rotation.y = 0; // Force front view for screenshot
        }
    });

    return (
        <group dispose={null} scale={scale}>
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
                            roughness={1}
                            metalness={0}
                            depthWrite={false}
                        >
                            <RenderTexture attach="map">
                                <PerspectiveCamera makeDefault manual aspect={2 / 1} position={[0, 0, 5]} />
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
                    {/* Crinkled edges */}
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

            {/* Inner "Glitter" or fill illusion */}
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


// Helper to capture screenshot from inside Canvas
function ScreenshotHandler({ onCapture }: { onCapture: (fn: () => string) => void }) {
    const { gl, scene, camera } = useThree();
    useEffect(() => {
        onCapture(() => {
            gl.render(scene, camera);
            return gl.domElement.toDataURL('image/png', 0.8); // 0.8 quality
        });
    }, [gl, scene, camera, onCapture]);
    return null;
}

export default function BaubleConfigurator() {
    const [config, setConfig] = useState<BaubleConfig | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<string>('');
    const [color, setColor] = useState('#D91A1A'); // Default Red
    const [text, setText] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);
    const { addItem } = useCart();
    const captureRef = useRef<() => string>(() => ''); // Ref to hold capture function

    useEffect(() => {
        getConfiguratorSettings().then(data => {
            setConfig(data);
            if (data.sizes.length > 0) {
                // Select first size by default
                setSelectedSizeId(data.sizes[0].id);
            }
            if (data.colors.length > 0 && !data.colors.some(c => c.hex === color)) {
                // If default color not in config, pick first
                setColor(data.colors[0].hex);
            }
        });
    }, []);

    if (!config) return <div className="h-[90vh] bg-neutral-950 flex items-center justify-center text-white">Ładowanie konfiguratora...</div>;

    const selectedSize = config.sizes.find(s => s.id === selectedSizeId) || config.sizes[0];
    const selectedColor = config.colors.find(c => c.hex === color);

    // Pricing Logic
    const currentPrice = config ? calculateBaublePrice({
        sizeId: selectedSize.id,
        colorHex: selectedColor.hex,
        text: text
    }, config) : 0;




    const handleAddToCart = async () => {
        if (!selectedSize || !selectedColor) return;

        // Start capture mode (stops rotation)
        setIsCapturing(true);

        // Wait a bit for React to render the "stopped" state and Three.js to update
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture screenshot
        const screenshot = captureRef.current ? captureRef.current() : '/bauble-placeholder.png';

        // End capture mode
        setIsCapturing(false);

        addItem({
            id: `config-${crypto.randomUUID()}`,
            name: `Bombka ${selectedSize.label} (${selectedColor.name})`,
            price: currentPrice,
            slug: 'bombka-personalizowana',
            quantity: 1,
            image: screenshot, // Use captured screenshot
            configuration: JSON.stringify({
                size: selectedSize.label,
                color: selectedColor.name,
                text: text
            })
        });
        toast.success(`Dodano do koszyka: ${selectedSize.label} - ${selectedColor.name}`);
    };

    return (
        <section className="h-[90vh] w-full bg-neutral-950 text-white relative flex flex-col md:flex-row overflow-hidden">
            {/* Left Panel - UI */}
            <div className="w-full md:w-1/3 min-w-[350px] bg-neutral-900/80 backdrop-blur-md p-8 flex flex-col justify-center z-10 border-r border-white/5 overflow-y-auto">
                <div className="mb-6">
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
                        Kreator Ozdób
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Zaprojektuj unikalną ozdobę choinkową. Wybierz rozmiar, kolor i dodaj osobistą dedykację.
                    </p>
                </div>

                <div className="space-y-6 flex-grow">
                    {/* Size Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                            Wybierz Rozmiar
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {config.sizes.map(size => (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedSizeId(size.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${selectedSizeId === size.id
                                        ? 'bg-amber-500 text-black border-amber-500'
                                        : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    {size.label}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-amber-500 font-bold">
                            Cena podstawowa: {selectedSize?.basePrice} PLN
                        </p>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                            Wybierz Kolor Szkła
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {config.colors.map(c => (
                                <button
                                    key={c.hex}
                                    onClick={() => setColor(c.hex)}
                                    className={`relative aspect-square rounded-xl border-2 transition-all duration-300 group overflow-hidden ${color === c.hex ? 'border-amber-500 ring-2 ring-amber-500/20 scale-105' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    <div className="absolute inset-0" style={{ backgroundColor: c.hex }} />
                                    {/* Glass Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {c.price > 0 && (
                                        <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-black/50 px-1 py-0.5 rounded text-amber-500">
                                            +{c.price}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-sm text-gray-300 font-medium">
                            {selectedColor?.name}
                        </p>
                    </div>

                    {/* Text Input */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                            Twoja Dedykacja <span className="text-amber-500">(+{config.addons.textPrice} PLN)</span>
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
                <div className="pt-6 border-t border-white/10 mt-4">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-sm text-gray-400">Cena całkowita</span>
                        <span className="text-3xl font-bold text-white">{currentPrice.toFixed(2)} zł</span>
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
                <Canvas shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <Suspense fallback={null}>
                        <ScreenshotHandler onCapture={fn => captureRef.current = fn} />

                        {/* Studio Lighting Environment */}
                        <Environment preset="studio" blur={1} background={false} />

                        {/* Additional Lights for Glass Sparkle */}
                        <ambientLight intensity={0.2} />
                        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#blue" />

                        <Float speed={isCapturing ? 0 : 1.5} rotationIntensity={isCapturing ? 0 : 0.5} floatIntensity={0.5}>
                            <Bauble color={color} text={text} scale={selectedSize?.scale || 1} isCapturing={isCapturing} />
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
