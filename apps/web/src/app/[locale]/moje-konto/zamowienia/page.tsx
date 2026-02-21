import { prisma } from "@bolglass/database";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Link } from "@/i18n/navigation";
import { Card, Button } from "@bolglass/ui";
import { Package } from "lucide-react";
import OrderCard from "./OrderCard";
import { getTranslations } from "next-intl/server";

export default async function OrderHistoryPage() {
    const session = await auth();
    const t = await getTranslations('Account.orders');

    if (!session?.user?.id) {
        redirect("/login");
    }

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            items: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });



    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-amber-50">{t('title')}</h1>
                <p className="text-amber-200/40 text-sm font-medium">{t('subtitle')}</p>
            </div>

            {orders.length === 0 ? (
                <Card className="p-12 text-center space-y-4">
                    <div className="bg-gray-50 p-4 rounded-full w-fit mx-auto">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-medium">{t('empty')}</p>
                    <Link href="/sklep">
                        <Button variant="primary">{t('goToShop')}</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
