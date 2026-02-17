'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { auth } from '@/auth';
import { GalleryItem } from '@/types/gallery';

// Robust path handling
const isWebPackage = process.cwd().endsWith('web') || require('fs').existsSync(join(process.cwd(), 'public'));
const UPLOAD_DIR = isWebPackage
    ? join(process.cwd(), 'public', 'uploads', 'gallery')
    : join(process.cwd(), 'apps', 'web', 'public', 'uploads', 'gallery');

async function ensureAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
    try {
        const items = await prisma.galleryItem.findMany({
            orderBy: { order: 'asc' }
        });
        return items as unknown as GalleryItem[];
    } catch (error) {
        console.error('Error fetching gallery items:', error);
        return [];
    }
}

export async function getHomeGalleryItems(): Promise<GalleryItem[]> {
    try {
        const items = await prisma.galleryItem.findMany({
            where: { displayHome: true },
            orderBy: { order: 'asc' },
            take: 6
        });
        return items as unknown as GalleryItem[];
    } catch (error) {
        console.error('Error fetching home gallery items:', error);
        return [];
    }
}

export async function uploadGalleryMedia(formData: FormData) {
    await ensureAdmin();

    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        await mkdir(UPLOAD_DIR, { recursive: true });

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name.replaceAll(' ', '_')}`;
        const filePath = join(UPLOAD_DIR, fileName);

        await writeFile(filePath, buffer);

        const isVideo = file.type.startsWith('video/') ||
            ['.mov', '.m4v', '.mp4', '.webm'].includes(extname(file.name).toLowerCase());

        return {
            success: true,
            url: `/uploads/gallery/${fileName}`,
            type: isVideo ? 'VIDEO' : 'IMAGE'
        };
    } catch (error: any) {
        console.error('Upload failed:', error);
        return { success: false, error: error.message };
    }
}

export async function createGalleryItem(data: {
    title?: string;
    description?: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    category?: string;
    displayHome?: boolean;
    order?: number;
}) {
    await ensureAdmin();

    try {
        const item = await prisma.galleryItem.create({
            data: {
                ...data,
                displayHome: data.displayHome ?? false,
                order: data.order ?? 0
            }
        });
        revalidatePath('/', 'layout');
        return { success: true, item };
    } catch (error: any) {
        console.error('Create failed:', error);
        return { success: false, error: error.message };
    }
}

export async function updateGalleryItem(id: string, data: Partial<{
    title: string;
    description: string;
    category: string;
    displayHome: boolean;
    order: number;
}>) {
    await ensureAdmin();

    try {
        const item = await prisma.galleryItem.update({
            where: { id },
            data
        });
        revalidatePath('/', 'layout');
        return { success: true, item };
    } catch (error: any) {
        console.error('Update failed:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteGalleryItem(id: string) {
    await ensureAdmin();

    try {
        await prisma.galleryItem.delete({
            where: { id }
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Delete failed:', error);
        return { success: false, error: error.message };
    }
}
