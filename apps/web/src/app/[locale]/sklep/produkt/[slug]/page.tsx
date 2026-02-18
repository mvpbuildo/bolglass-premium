import { prisma } from '@bolglass/database';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@bolglass/ui';
import AddToCartButton from '@/components/shop/AddToCartButton';
import ProductGallery from '@/components/shop/ProductGallery';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
    const product = await prisma.product.findFirst({
        where: { slug },
    });
    return product;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image Gallery */}
                    <div className="flex flex-col-reverse">
                        <ProductGallery images={product.images} productName={product.name} />
                    </div>

                    {/* Product Info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            {product.discountPercent > 0 ? (
                                <div className="flex items-baseline gap-3">
                                    <p className="text-3xl font-black text-red-600">
                                        {(product.price * (1 - product.discountPercent / 100)).toFixed(2)} PLN
                                    </p>
                                    <p className="text-xl text-gray-400 line-through">
                                        {product.price.toFixed(2)} PLN
                                    </p>
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                                        -{product.discountPercent}%
                                    </span>
                                </div>
                            ) : (
                                <p className="text-3xl text-gray-900">{product.price.toFixed(2)} PLN</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Cena brutto (zawiera VAT)</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center">
                                <span className={`flex-shrink-0 inline-block h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true"></span>
                                <p className="ml-2 text-sm text-gray-500">
                                    {product.stock > 0 ? 'Dostępny w magazynie' : 'Niedostępny'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col">
                            <AddToCartButton product={product} />

                            {product.isConfigurable && (
                                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <h4 className="font-bold text-purple-900 mb-2">✨ Produkt Konfigurowalny 3D</h4>
                                    <p className="text-sm text-purple-700 mb-3">
                                        Ten produkt możesz spersonalizować w naszym kreatorze 3D przed zakupem.
                                    </p>
                                    <Button variant="outline" className="w-full text-purple-700 border-purple-300 hover:bg-purple-100">
                                        Otwórz Konfigurator
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Product Specs */}
                        <section aria-labelledby="details-heading" className="mt-12">
                            <h2 id="details-heading" className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Szczegóły Produktu</h2>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">EAN</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.ean || '-'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Kod Producenta</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.manufacturerCode || '-'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Wymiary (WxSxG)</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {product.height} x {product.width} x {product.depth} cm
                                    </dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Waga</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.weight} kg</dd>
                                </div>
                            </dl>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
