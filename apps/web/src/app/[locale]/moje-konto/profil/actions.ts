'use server'

import { prisma } from '@bolglass/database';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const name = formData.get('name') as string;
    const isCompany = formData.get('isCompany') === 'on';
    const companyName = formData.get('companyName') as string;
    const nip = formData.get('nip') as string;
    const companyStreet = formData.get('companyStreet') as string;
    const companyCity = formData.get('companyCity') as string;
    const companyZip = formData.get('companyZip') as string;

    // New Personal Address Fields
    const personalPhone = formData.get('personalPhone') as string;
    const personalStreet = formData.get('personalStreet') as string;
    const personalCity = formData.get('personalCity') as string;
    const personalZipCode = formData.get('personalZipCode') as string;

    // New Shipping Address Fields
    const shippingFirstName = formData.get('shippingFirstName') as string;
    const shippingLastName = formData.get('shippingLastName') as string;
    const shippingPhone = formData.get('shippingPhone') as string;
    const shippingStreet = formData.get('shippingStreet') as string;
    const shippingCity = formData.get('shippingCity') as string;
    const shippingZipCode = formData.get('shippingZipCode') as string;

    await prisma.user.update({
        where: { id: userId },
        data: {
            name,
            isCompany,
            companyName: isCompany ? companyName : null,
            nip: isCompany ? nip : null,
            companyStreet: isCompany ? companyStreet : null,
            companyCity: isCompany ? companyCity : null,
            companyZip: isCompany ? companyZip : null,
            // Personal
            personalPhone,
            personalStreet,
            personalCity,
            personalZipCode,
            // Shipping
            shippingFirstName,
            shippingLastName,
            shippingPhone,
            shippingStreet,
            shippingCity,
            shippingZipCode,
        }
    });

    revalidatePath('/[locale]/moje-konto/profil', 'page');
    return { success: true };
}
