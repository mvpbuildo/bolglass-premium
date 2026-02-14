const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating all slots capacity to 100...');
    const result = await prisma.slot.updateMany({
        data: {
            capacity: 100
        }
    });
    console.log(`Updated ${result.count} slots.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
