'use client';

import { Link } from '@/i18n/navigation';
import { Button, Card } from '@bolglass/ui';
import { Product } from '@prisma/client';
import { deleteProduct, updateProductDiscount } from './actions';
import { useState, useEffect } from 'react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [discount, setDiscount] = useState(product.discountPercent || 0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [eurRate, setEurRate] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/currency')
            .then(r => r.json())
            .then((d: { rate: number }) => setEurRate(d.rate))
            .catch(() => setEurRate(4.25));
    }, []);

    const eurPrice = eurRate ? Math.ceil(product.price * (1 - discount / 100) / eurRate) : null;

    const handleDiscountUpdate = async (newDiscount: number) => {
        setIsUpdating(true);
        const result = await updateProductDiscount(product.id, newDiscount);
        setIsUpdating(false);
        if (result.error) {
            alert(result.error);
        }
    };

    const handleDelete = async () => {
        if (confirm(`Czy na pewno chcesz usunąć produkt "${product.name}"? Tej operacji nie można cofnąć.`)) {
            setIsDeleting(true);
            const result = await deleteProduct(product.id);
            if (result.error) {
                alert(result.error);
                setIsDeleting(false);
            }
        }
    };

    const discountedPrice = product.price * (1 - discount / 100);

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow relative group">
            <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <span className="text-4xl">📦</span>
                )}
                {product.isConfigurable && (
                    <span className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full">
                        3D CONFIG
                    </span>
                )}
                {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        -{discount}%
                    </span>
                )}
            </div>
            <div className="p-4">
                <div className="mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1" title={product.name}>{product.name}</h3>
                    <div className="flex justify-between items-baseline mt-1">
                        <div className="flex flex-col">
                            {discount > 0 && (
                                <span className="text-xs text-gray-400 line-through">{product.price.toFixed(2)} PLN</span>
                            )}
                            <span className={`font-mono font-bold whitespace-nowrap ${discount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {discountedPrice.toFixed(2)} PLN
                            </span>
                            {eurPrice !== null && (
                                <span className="text-[11px] font-bold text-blue-600 mt-0.5">
                                    ≈ {eurPrice} EUR
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Rabat %</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                onBlur={(e) => handleDiscountUpdate(Number(e.target.value))}
                                className="w-12 text-center text-sm border border-gray-300 rounded bg-gray-50 text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{product.description}</p>

                <div className="flex gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full text-xs">Edytuj</Button>
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-gray-50 text-red-600 hover:bg-red-50 border border-gray-200 rounded text-xs font-medium transition-colors disabled:opacity-50"
                        title="Usuń produkt"
                    >
                        {isDeleting ? '...' : '🗑️'}
                    </button>
                </div>
            </div>
        </Card>
    );
}
