const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address: node promote-admin.js user@example.com');
    process.exit(1);
}

async function main() {
    console.log(`Searching for user with email: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email: email }
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        process.exit(1);
    }

    console.log(`Found user: ${user.name || 'No Name'} (ID: ${user.id}). Current role: ${user.role}`);

    const updatedUser = await prisma.user.update({
        where: { email: email },
        data: { role: 'ADMIN' }
    });

    console.log(`✅ Success! User ${email} has been promoted to ADMIN.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
