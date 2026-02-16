'use server';

import fs from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const UPLOADS_DIR = path.join(process.cwd(), 'apps/web/public/uploads');

export async function listFiles() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        // Ensure directory exists
        await fs.mkdir(UPLOADS_DIR, { recursive: true });

        const files = await fs.readdir(UPLOADS_DIR, { withFileTypes: true });

        const results = await Promise.all(files.map(async (file) => {
            const filePath = path.join(UPLOADS_DIR, file.name);
            const stats = await fs.stat(filePath);

            return {
                name: file.name,
                isDirectory: file.isDirectory(),
                size: stats.size,
                createdAt: stats.birthtime,
                url: `/uploads/${file.name}`
            };
        }));

        return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
}

export async function deleteFile(fileName: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        const filePath = path.join(UPLOADS_DIR, fileName);

        // Security check: Ensure we are only deleting files within the uploads directory
        if (!filePath.startsWith(UPLOADS_DIR)) {
            throw new Error('Security violation: Attempted to delete file outside of uploads directory');
        }

        await fs.unlink(filePath);
        revalidatePath('/admin/files');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting file:', error);
        throw new Error(error.message || 'Błąd podczas usuwania pliku');
    }
}
