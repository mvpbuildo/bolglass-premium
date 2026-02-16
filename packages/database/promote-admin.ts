import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error('BŁĄD: Podaj adres email jako argument.');
        console.log('Użycie: npx tsx promote-admin.ts user@email.pl');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`BŁĄD: Użytkownik o adresie ${email} nie został znaleziony.`);
            process.exit(1);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });

        console.log(`SUKCES: Użytkownik ${email} otrzymał uprawnienia ADMIN.`);
    } catch (error) {
        console.error('Wystąpił błąd podczas aktualizacji bazy danych:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

promoteAdmin();
