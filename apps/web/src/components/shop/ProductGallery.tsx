'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@prisma/client';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square w-full relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-300">
                <span className="text-6xl">📦</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col-reverse">
            {/* Main Image */}
            <div className="aspect-square w-full relative bg-gray-100 rounded-lg overflow-hidden">
                <Image
                    src={selectedImage}
                    alt={productName}
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="mt-6 w-full max-w-2xl mx-auto block lg:max-w-none">
                    <div className="grid grid-cols-4 gap-6">
                        {images.map((image, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedImage(image)}
                                className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase cursor-pointer hover:bg-gray-50 border-2 ${selectedImage === image ? 'border-blue-500' : 'border-transparent'}`}
                            >
                                <span className="sr-only">Image {idx + 1}</span>
                                <span className="absolute inset-0 rounded-md overflow-hidden">
                                    <Image src={image} alt="" fill className="object-cover object-center" />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
