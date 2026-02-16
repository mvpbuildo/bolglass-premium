import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function promoteAdmin() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email) {
        console.error('BŁĄD: Podaj adres email jako argument.');
        console.log('Użycie: npx tsx promote-admin.ts user@email.pl [nowe_haslo]');
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

        const data: any = { role: 'ADMIN' };

        if (password) {
            console.log(`Haszowanie nowego hasła dla ${email}...`);
            data.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: user.id },
            data
        });

        console.log(`SUKCES: Użytkownik ${email} otrzymał uprawnienia ADMIN${password ? ' oraz nowe hasło' : ''}.`);
    } catch (error) {
        console.error('Wystąpił błąd podczas aktualizacji bazy danych:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

promoteAdmin();
