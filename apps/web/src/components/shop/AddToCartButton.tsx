'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@bolglass/ui';
import { useState } from 'react';

// Define a minimal product type for the cart
type Product = {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
    stock: number;
    discountPercent?: number; // Add this
    // Add other fields if needed for cart logic
};

export default function AddToCartButton({ product }: { product: Product }) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        const effectivePrice = product.price * (1 - (product.discountPercent || 0) / 100);

        addItem({
            id: product.id,
            name: product.name,
            price: effectivePrice,
            image: product.images[0],
            quantity: quantity,
            slug: product.slug
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    disabled={quantity <= 1}
                >
                    -
                </button>
                <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    disabled={quantity >= product.stock}
                >
                    +
                </button>
            </div>

            <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 text-lg transition-all ${isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
            >
                {isAdded ? '✓ Dodano!' : (product.stock > 0 ? 'Dodaj do Koszyka' : 'Niedostępny')}
            </Button>
        </div>
    );
}
