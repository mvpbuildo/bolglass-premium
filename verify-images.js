const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log(`Found ${products.length} products.`);

        for (const product of products) {
            console.log(`\nProduct: ${product.name} (ID: ${product.id})`);
            console.log(`Images stored in DB:`, product.images);

            if (product.images && product.images.length > 0) {
                for (const imgPath of product.images) {
                    // Assuming imgPath is like "/uploads/filename.jpg"
                    // And the physical path is apps/web/public/uploads/filename.jpg

                    const relativePath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
                    const physicalPath = path.join(process.cwd(), 'apps', 'web', 'public', relativePath);

                    if (fs.existsSync(physicalPath)) {
                        console.log(`✅ File exists: ${physicalPath}`);
                    } else {
                        console.log(`❌ File NOT found: ${physicalPath}`);
                    }
                }
            } else {
                console.log("No images found for this product.");
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
