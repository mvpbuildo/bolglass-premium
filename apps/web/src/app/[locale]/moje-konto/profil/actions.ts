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
        }
    });

    revalidatePath('/[locale]/moje-konto/profil', 'page');
    return { success: true };
}
