'use server';

import { prisma } from '@bolglass/database';
import bcrypt from 'bcryptjs';

export async function registerUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const isCompany = formData.get('isCompany') === 'true';

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return { error: "Użytkownik o takim adresie email już istnieje." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Profile Data
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const zipCode = formData.get('zipCode') as string;
    const phone = formData.get('phone') as string;

    // Company Data / Personal Name
    // For company: Name is Company Name, but User model has just 'name'. 
    // Let's store company name in companyName field, and maybe contact person name in 'name' if provided?
    // Actually simplicity:
    // User.name = "Jan Kowalski" (Individual) OR "Firma ABC" (Company - hack?)
    // Better:
    // Individual: name = "Jan Kowalski"
    // Company: companyName = "Firma ABC", name = "Firma ABC" (or leave name empty/contact person)

    // As per form:
    // Individual: has 'name' input.
    // Company: has 'companyName' and 'nip' inputs.

    let name = formData.get('name') as string;
    const companyName = formData.get('companyName') as string;
    const nip = formData.get('nip') as string;

    if (isCompany) {
        name = companyName; // Use company name as display name for now
    }

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            phone,
            street,
            city,
            zipCode,
            country: 'PL',
            isCompany,
            companyName: isCompany ? companyName : null,
            nip: isCompany ? nip : null,
            role: 'USER'
        }
    });

    return { success: true };
}
