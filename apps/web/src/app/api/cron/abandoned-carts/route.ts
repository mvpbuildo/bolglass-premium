import { prisma } from '@bolglass/database';
import { NextResponse } from 'next/server';
import { sendAbandonedCartEmail } from '@/lib/mail';

// Ten endpoint będzie wywoływany przez zewnętrzne serwisy CRON (np. cron-job.org)
export async function GET(request: Request) {
    // Prosta autoryzacja - tylko do autoryzowanych pingów puszczanych ze skryptu VPS
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'bolglass-secret-cron-key'}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const now = new Date();
        const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 godziny temu
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Max 24h wstecz, żeby nie wysyłać mego starych

        console.log(`[CRON] Skanowanie bazy pod kątem porzuconych koszyków... (Przedział: ${twentyFourHoursAgo.toISOString()} - ${fourHoursAgo.toISOString()})`);

        // Szukamy zamówień o statusie PENDING, u których nie upłynął wiek większy niż 24h,
        // a minęły już minimum 4 godziny + nie wysyłano jeszcze emaila ratującego.
        const abandonedOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    lt: fourHoursAgo,
                    gt: twentyFourHoursAgo
                },
                abandonedEmailSentAt: null
            },
            include: {
                user: true,
                items: true
            }
        });

        console.log(`[CRON] Znaleziono ${abandonedOrders.length} porzuconych zamówień do ocalenia.`);

        let successCount = 0;
        let failCount = 0;

        for (const order of abandonedOrders) {
            try {
                // Skrypt lokalizuący preferencje językowe - jeśli gość, uznaje default
                const locale = order.user?.locale || 'pl';

                await sendAbandonedCartEmail(order, locale);

                // Oflagowanie by nie wysyłać ponownie
                await prisma.order.update({
                    where: { id: order.id },
                    data: { abandonedEmailSentAt: new Date() }
                });

                successCount++;
            } catch (err) {
                console.error(`[CRON] Nie udało się wysłać maila do Order: ${order.id}`, err);
                failCount++;
            }
        }

        return NextResponse.json({
            status: 'ok',
            scanned: abandonedOrders.length,
            success: successCount,
            failed: failCount
        });

    } catch (e: any) {
        console.error("[CRON] Fatal Error in execution:", e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
