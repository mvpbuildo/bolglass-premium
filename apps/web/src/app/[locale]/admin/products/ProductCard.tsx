'use client';

import { Link } from '@/i18n/navigation';
import { Button, Card } from '@bolglass/ui';
import { Product } from '@prisma/client';
import { deleteProduct } from './actions';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm(`Czy na pewno chcesz usunąć produkt "${product.name}"? Tej operacji nie można cofnąć.`)) {
            setIsDeleting(true);
            const result = await deleteProduct(product.id);
            if (result.error) {
                alert(result.error);
                setIsDeleting(false);
            }
            // If success, revalidatePath will refresh the list, so we don't need to do anything else.
        }
    };

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
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1" title={product.name}>{product.name}</h3>
                    <span className="font-mono text-green-600 font-bold whitespace-nowrap ml-2">{product.price.toFixed(2)} PLN</span>
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
