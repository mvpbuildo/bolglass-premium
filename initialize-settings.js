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
            { key: 'email_body_workshop', value: 'Dziękujemy za rezerwację warsztatów w Bolglass!\nData: {{date}}\nLiczba osób: {{people}}\nSuma do zapłaty: {{total}} zł' },
            { key: 'email_subject_reminder', value: 'Przypomnienie o wizycie w Bolglass' },
            { key: 'email_body_reminder', value: 'Dzień dobry!\nPrzypominamy o rezerwacji na jutro.\nData: {{date}}\nLiczba osób: {{people}}\nSuma do zapłaty: {{total}} zł' },
            {
                key: 'bauble_config',
                value: JSON.stringify({
                    sizes: [
                        { id: '8cm', label: '8 cm', basePrice: 29.99, scale: 0.8 },
                        { id: '10cm', label: '10 cm', basePrice: 34.99, scale: 1.0 },
                        { id: '12cm', label: '12 cm', basePrice: 44.99, scale: 1.2 },
                        { id: '15cm', label: '15 cm', basePrice: 59.99, scale: 1.5 }
                    ],
                    colors: [
                        { hex: '#D91A1A', name: 'Czerwień Królewska', price: 0 },
                        { hex: '#1E40AF', name: 'Głębia Oceanu', price: 0 },
                        { hex: '#047857', name: 'Szmaragdowy Las', price: 0 },
                        { hex: '#F59E0B', name: 'Złoty Bursztyn', price: 5 },
                        { hex: '#FCD34D', name: 'Jasne Złoto', price: 5 },
                        { hex: '#9333EA', name: 'Purpura Władców', price: 5 }
                    ],
                    addons: { textPrice: 10 }
                })
            }
        ];

        for (const s of settings) {
            // Check if exists
            const existing = await prisma.systemSetting.findUnique({ where: { key: s.key } });

            if (!existing || (s.key.includes('body') && existing.value.length < 20)) {
                // Create or overwrite if it's just the default/empty
                await prisma.systemSetting.upsert({
                    where: { key: s.key },
                    update: { value: s.value },
                    create: s
                });
                console.log(`Setting [${s.key}] updated with professional template.`);
            } else {
                console.log(`Setting [${s.key}] already exists (custom).`);
            }
        }

        console.log('--- Initialization Complete ---');
    } catch (e) {
        console.error('ERROR during initialization:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
