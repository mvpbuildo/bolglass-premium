const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Initializing System Settings ---');
    try {
        const settings = [
            { key: 'price_sightseeing', value: '35' },
            { key: 'price_workshop', value: '60' },
            { key: 'smtp_host', value: 'mail.bolann.cloud' },
            { key: 'smtp_port', value: '587' },
            { key: 'smtp_user', value: 'rezerwacje@bolann.cloud' },
            { key: 'smtp_from', value: 'rezerwacje@bolann.cloud' },
            { key: 'email_subject_sightseeing', value: 'Potwierdzenie rezerwacji zwiedzania - Bolglass' },
            { key: 'email_body_sightseeing', value: 'Dziękujemy za rezerwację zwiedzania w Bolglass!\nData: {{date}}\nLiczba osób: {{people}}\nSuma do zapłaty: {{total}} zł' },
            { key: 'email_subject_workshop', value: 'Potwierdzenie rezerwacji warsztatów - Bolglass' },
            { key: 'email_body_workshop', value: 'Dziękujemy za rezerwację warsztatów w Bolglass!\nData: {{date}}\nLiczba osób: {{people}}\nSuma do zapłaty: {{total}} zł' }
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
