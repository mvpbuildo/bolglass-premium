'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function deleteProduct(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            select: { images: true }
        });

        if (!product) {
            return { error: "Produkt nie został znaleziony." };
        }

        // Delete images from filesystem
        if (product.images && product.images.length > 0) {
            // Robust path handling
            const isWebPackage = process.cwd().endsWith('web') || require('fs').existsSync(join(process.cwd(), 'public'));

            const uploadDir = isWebPackage
                ? join(process.cwd(), 'public')
                : join(process.cwd(), 'apps', 'web', 'public');

            for (const imgPath of product.images) {
                try {
                    // imgPath is like "/uploads/filename.jpg", so we join it with public root
                    // remove leading slash if present to avoid absolute path confusion
                    const relativePath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
                    const fullPath = join(uploadDir, relativePath);
                    await unlink(fullPath);
                } catch (err) {
                    console.error(`Failed to delete image ${imgPath}:`, err);
                    // Continue deleting other images/product even if one file fails
                }
            }
        }

        await prisma.product.delete({
            where: { id }
        });

        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Delete product failed:", error);
        return { error: "Wystąpił błąd podczas usuwania produktu." };
    }
}
