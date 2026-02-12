import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const dates = [
        new Date('2026-02-20T10:00:00Z'),
        new Date('2026-02-22T10:00:00Z'),
        new Date('2026-02-25T14:00:00Z'),
    ];

    console.log('Seed: Creating slots...');

    for (const date of dates) {
        await prisma.slot.upsert({
            where: { date },
            update: {},
            create: {
                date,
                capacity: 10,
            },
        });
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
