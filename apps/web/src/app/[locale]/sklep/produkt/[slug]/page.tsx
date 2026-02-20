import { prisma } from '@bolglass/database';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@bolglass/ui';
import AddToCartButton from '@/components/shop/AddToCartButton';
import ProductGallery from '@/components/shop/ProductGallery';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
    const product = await prisma.product.findFirst({
        where: { slug },
        include: { translations: true }
    });
    return product;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const product = await getProduct(slug);
    const t = await getTranslations('Shop');

    if (!product) {
        notFound();
    }

    const translation = product.translations.find(t => t.locale === locale);
    const localizedProduct = {
        ...product,
        name: translation?.name || product.name,
        description: translation?.description || product.description
    };

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
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{localizedProduct.name}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">{t('productDetails')}</h2>
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
                            <p className="text-sm text-gray-500 mt-1">{t('priceInclVat')}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">{t('productDescription')}</h3>
                            <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: localizedProduct.description }} />
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center">
                                <span className={`flex-shrink-0 inline-block h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true"></span>
                                <p className="ml-2 text-sm text-gray-500">
                                    {product.stock > 0 ? t('inStock') : t('outOfStock')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col">
                            <AddToCartButton product={product} />

                            {product.isConfigurable && (
                                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <h4 className="font-bold text-purple-900 mb-2">{t('configurable3d')}</h4>
                                    <p className="text-sm text-purple-700 mb-3">
                                        {t('configurable3dDesc')}
                                    </p>
                                    <Link href={`/${locale}`}>
                                        <Button variant="outline" className="w-full text-purple-700 border-purple-300 hover:bg-purple-100">
                                            {t('openConfigurator')}
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Product Specs */}
                        <section aria-labelledby="details-heading" className="mt-12">
                            <h2 id="details-heading" className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">{t('productDetails')}</h2>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">EAN</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.ean || '-'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">{t('manufacturerCodeLabel')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.manufacturerCode || '-'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">{t('dimensionsLabel')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {product.height} x {product.width} x {product.depth} cm
                                    </dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">{t('weightLabel')}</dt>
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
