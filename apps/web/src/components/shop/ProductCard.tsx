'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@bolglass/ui';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

type ProductProps = {
    id: string;
    name: string;
    price: number;
    image: string | null;
    slug: string;
    priceNet: number;
    vatRate: number;
    discountPercent: number; // Add this
};

export default function ProductCard({ product }: { product: ProductProps }) {
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();

    const handleAddToCart = () => {
        const effectivePrice = product.price * (1 - (product.discountPercent || 0) / 100);
        addItem({
            id: product.id,
            name: product.name,
            price: effectivePrice,
            image: product.image || undefined,
            quantity: 1,
            slug: product.slug
        });
    };

    return (
        <div className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-md transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_0_50px_rgba(245,158,11,0.1)] h-full flex flex-col">
            <Link href={`/sklep/produkt/${product.slug}`} className="block relative aspect-square overflow-hidden bg-white/5">
                <Image
                    src={product.image || '/placeholder-bauble.png'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                {/* Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] transform skew-x-[-25deg] pointer-events-none"></div>
            </Link>

            <div className="p-6 space-y-4 flex flex-col flex-grow">
                <div className="space-y-1">
                    <Link href={`/sklep/produkt/${product.slug}`}>
                        <h3 className="text-xl font-serif text-amber-50 line-clamp-1 group-hover:text-amber-200 transition-colors leading-tight">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="text-[10px] text-amber-500/40 font-black uppercase tracking-widest">Manufaktura Bolglass</p>
                </div>

                <div className="mt-auto flex items-center justify-between">

                    <div className="flex flex-col">
                        {product.discountPercent > 0 ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-red-500 tracking-tighter">
                                        {formatPrice(product.price * (1 - product.discountPercent / 100))}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through decoration-red-500/50">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                                <span className="text-[10px] text-red-400/80 font-medium uppercase tracking-tight">Promocja -{product.discountPercent}%</span>
                            </>
                        ) : (
                            <>
                                <span className="text-2xl font-black text-white tracking-tighter">
                                    {formatPrice(product.price)}
                                </span>
                                <span className="text-[10px] text-white/20 font-medium uppercase tracking-tight">Cena Brutto</span>
                            </>
                        )}
                    </div>
                    <Button
                        onClick={handleAddToCart}
                        size="sm"
                        className="rounded-full h-11 w-11 p-0 bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all shadow-lg hover:shadow-amber-500/20"
                        title="Dodaj do koszyka"
                    >
                        <ShoppingCart className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Subtle glow border effect */}
            <div className="absolute inset-0 border border-transparent group-hover:border-amber-500/20 rounded-2xl pointer-events-none transition-colors duration-500"></div>
        </div>
    );
}
