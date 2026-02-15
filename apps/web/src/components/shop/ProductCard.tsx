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
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group flex flex-col h-full">
            <Link href={`/sklep/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                )}
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <Link href={`/sklep/${product.slug}`}>
                    <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 min-h-[3rem]">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                        <p className="text-lg font-black text-gray-900">{product.price.toFixed(2)} zł</p>
                        <p className="text-xs text-gray-400">Brutto (zawiera VAT)</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleAddToCart}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4"
                    >
                        + Do Koszyka
                    </Button>
                </div>
            </div>
        </div>
    );
}
