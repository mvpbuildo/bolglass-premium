const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    console.log('--- DB DEBUG START ---');
    try {
        const slotsCount = await prisma.slot.count();
        console.log('Total slots in DB:', slotsCount);

        if (slotsCount > 0) {
            const firstSlot = await prisma.slot.findFirst();
            console.log('First slot sample:', JSON.stringify(firstSlot, null, 2));

            const futureSlots = await prisma.slot.count({
                where: { date: { gte: new Date() } }
            });
            console.log('Future slots count:', futureSlots);
        } else {
            console.log('WARNING: Slots table is EMPTY. You might need to run the seed script.');
        }

        const bookingsCount = await prisma.booking.count();
        console.log('Total bookings in DB:', bookingsCount);

        const blocks = await prisma.globalBlock.count();
        console.log('Total global blocks:', blocks);

    } catch (e) {
        console.error('DATABASE ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
    console.log('--- DB DEBUG END ---');
}

debug();
