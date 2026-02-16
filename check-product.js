const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const product = await prisma.product.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        console.log("Latest Product:", JSON.stringify(product, null, 2));
    } catch (error) {
        console.error("Error fetching product:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
