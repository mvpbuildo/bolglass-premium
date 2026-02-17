'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@bolglass/ui';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

type ProductProps = {
    id: string;
    name: string;
    price: number;
    image: string | null;
    slug: string;
    priceNet: number;
    vatRate: number;
    // Add other fields as needed
};

export default function ProductCard({ product }: { product: ProductProps }) {
    const { addItem } = useCart();

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price, // Gross price
            image: product.image || undefined,
            quantity: 1,
            slug: product.slug
        });
        // Optional: Toast notification here
    };

    return (
        <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
            {/* Image Container with Shine Effect */}
            <Link href={`/sklep/${product.slug}`} className="block relative aspect-[4/5] bg-gray-50 overflow-hidden">
                {product.image ? (
                    <>
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                        {/* Placeholder Icon */}
                    </div>
                )}
                {/* Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] transform skew-x-[-25deg]"></div>
            </Link>

            <div className="p-6 flex flex-col flex-grow bg-white/50 backdrop-blur-sm">
                <Link href={`/sklep/${product.slug}`}>
                    <h3 className="font-serif text-xl text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-tight mb-2">
                        {product.name}
                    </h3>
                </Link>
                {/* Decorative line */}
                <div className="w-12 h-0.5 bg-amber-200 mb-4 group-hover:w-full group-hover:bg-amber-400 transition-all duration-500"></div>

                <div className="mt-auto flex items-end justify-between gap-4">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight">{product.price.toFixed(2)} <span className="text-sm font-normal text-gray-500">zł</span></p>
                    </div>

                    <Button
                        size="sm"
                        onClick={handleAddToCart}
                        className="bg-gray-900 hover:bg-red-700 text-white rounded-xl px-6 py-2 shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                    >
                        Do Koszyka
                    </Button>
                </div>
            </div>

            {/* Glass Border Effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-500/20 rounded-2xl pointer-events-none transition-colors duration-500"></div>
        </div>
    );
}
