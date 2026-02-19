import { prisma } from '@bolglass/database';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, Button } from '@bolglass/ui';
import { Link } from '@/i18n/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default async function OrderConfirmationPage(props: { params: Promise<{ id: string, locale: string }>, searchParams: Promise<{ method?: string }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { id, locale } = params;
    const t = await getTranslations({ locale, namespace: 'Checkout' });

    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true }
    });

    if (!order) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {t('orderPlaced')}
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300">
                    {t('orderNumber')}: <span className="font-mono font-bold">{order.id}</span>
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-left space-y-2">
                    <p><strong>{t('total')}:</strong> {order.total.toFixed(2)} PLN</p>
                    <p><strong>{t('status')}:</strong> {order.status}</p>
                    <p><strong>{t('paymentMethod')}:</strong> {order.paymentProvider}</p>
                </div>

                <p className="text-gray-500">
                    {t('confirmationEmailSent')}
                </p>

                <div className="pt-4">
                    <Link href="/">
                        <Button className="w-full sm:w-auto">
                            {t('backToShop')} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
