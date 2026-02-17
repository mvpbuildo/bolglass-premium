import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const item = await prisma.galleryItem.create({
        data: {
            title: 'Magia Tworzenia',
            description: 'Ręczne dmuchanie luksusowych szklanych bombek - tradycja spotyka magię.',
            url: '/uploads/gallery/magia-tworzenia.png',
            type: 'IMAGE',
            category: 'PRODUCTION',
            displayHome: true,
            order: 0,
        }
    });
    console.log('Added hero image to gallery:', item.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
