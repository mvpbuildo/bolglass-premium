import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed: Creating hourly slots for the next 7 days...');

    const startHour = 8;
    const endHour = 17;
    const capacity = 30;

    const now = new Date();
    // Start from tomorrow
    const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    for (let day = 0; day < 7; day++) {
        const currentDay = new Date(baseDate);
        currentDay.setDate(baseDate.getDate() + day);

        for (let hour = startHour; hour <= endHour; hour++) {
            const slotDate = new Date(currentDay);
            slotDate.setHours(hour, 0, 0, 0);

            await prisma.slot.upsert({
                where: { date: slotDate },
                update: { capacity },
                create: {
                    date: slotDate,
                    capacity,
                },
            });
        }
    }

    console.log('Seed: Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
