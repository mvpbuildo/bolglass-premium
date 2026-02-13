const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Initializing System Settings ---');
    try {
        const settings = [
            { key: 'price_sightseeing', value: '35' },
            { key: 'price_workshop', value: '60' }
        ];

        for (const s of settings) {
            const result = await prisma.systemSetting.upsert({
                where: { key: s.key },
                update: {}, // Don't overwrite if already exists
                create: s
            });
            console.log(`Setting [${s.key}] checked/created.`);
        }

        console.log('--- Initialization Complete ---');
    } catch (e) {
        console.error('ERROR during initialization:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
