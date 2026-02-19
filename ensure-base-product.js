
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const slug = 'bombka-personalizowana';
    let product = await prisma.product.findUnique({ where: { slug } });

    if (!product) {
        console.log('Creating base product...');
        product = await prisma.product.create({
            data: {
                name: 'Bombka Personalizowana',
                slug: slug,
                description: 'Personalizowana bombka z kreatora 3D',
                price: 0, // Price is dynamic
                isConfigurable: true,
                images: ['/bauble-placeholder.png'],
            }
        });
    }

    console.log(`Base Product ID: ${product.id}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
