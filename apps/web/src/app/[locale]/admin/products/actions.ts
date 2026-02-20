'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath, revalidateTag } from 'next/cache';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
// import { writeFile } from 'fs/promises'; // Not used in this version but kept for ref
import { mkdir } from 'fs/promises';
import { writeFile } from 'fs/promises';

export async function createProduct(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const ean = formData.get('ean') as string || null;
        const manufacturerCode = formData.get('manufacturerCode') as string || null;

        const priceNet = parseFloat(formData.get('priceNet') as string);
        const vatRate = parseInt(formData.get('vatRate') as string);
        const discountPercent = parseInt(formData.get('discountPercent') as string || '0');
        const stock = parseInt(formData.get('stock') as string || '0');

        // Calculate Gross
        const price = priceNet * (1 + vatRate / 100);

        const weight = parseFloat(formData.get('weight') as string || '0');
        const height = parseFloat(formData.get('height') as string || '0');
        const width = parseFloat(formData.get('width') as string || '0');
        const depth = parseFloat(formData.get('depth') as string || '0');
        const packaging = formData.get('packaging') as string || null;

        const isConfigurable = formData.get('isConfigurable') === 'on';

        // --- Image Upload Logic ---
        const imageFiles = formData.getAll('images') as File[];
        const imageUrls: string[] = [];

        if (imageFiles && imageFiles.length > 0) {
            // Determine uploads directory
            // In Next.js monorepo, process.cwd() is usually the root of the running app (apps/web)
            // But we need to ensure ./public/uploads exists
            const uploadDir = join(process.cwd(), 'public', 'uploads');
            await mkdir(uploadDir, { recursive: true });

            for (const file of imageFiles) {
                if (file.size > 0 && file.name !== 'undefined') {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);

                    // Generate safe unique filename
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                    const filename = `${uniqueSuffix}-${safeName}`;
                    const filepath = join(uploadDir, filename);

                    await writeFile(filepath, buffer);
                    imageUrls.push(`/uploads/${filename}`);
                }
            }
        }

        // Generate Slug
        const slug = name.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');

        await prisma.product.create({
            data: {
                name,
                slug: `${slug}-${Date.now()}`, // Ensure uniqueness
                description,
                price, // Gross
                priceNet,
                vatRate,
                discountPercent,
                stock,
                ean,
                manufacturerCode,
                weight,
                height,
                width,
                depth,
                packaging,
                isConfigurable,
                images: imageUrls
            }
        });

        revalidateTag('products', 'max');
        revalidatePath('/admin/products', 'page');
        return { success: true };

    } catch (error) {
        console.error("Create product failed:", error);
        return { error: "Błąd podczas tworzenia produktu. Sprawdź poprawność danych." };
    }
}


export async function updateProduct(id: string, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const ean = formData.get('ean') as string || null;
        const manufacturerCode = formData.get('manufacturerCode') as string || null;

        const priceNet = parseFloat(formData.get('priceNet') as string);
        const vatRate = parseInt(formData.get('vatRate') as string);
        const discountPercent = parseInt(formData.get('discountPercent') as string || '0');
        const stock = parseInt(formData.get('stock') as string || '0');

        const price = priceNet * (1 + vatRate / 100);

        const weight = parseFloat(formData.get('weight') as string || '0');
        const height = parseFloat(formData.get('height') as string || '0');
        const width = parseFloat(formData.get('width') as string || '0');
        const depth = parseFloat(formData.get('depth') as string || '0');
        const packaging = formData.get('packaging') as string || null;

        const isConfigurable = formData.get('isConfigurable') === 'on';

        // --- Image Logic ---
        // 1. Existing images (JSON string)
        const existingImagesStr = formData.get('existingImages') as string;
        const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : [];

        // 2. New images
        const newImageFiles = formData.getAll('newImages') as File[];
        const newImageUrls: string[] = [];

        if (newImageFiles && newImageFiles.length > 0) {
            const uploadDir = join(process.cwd(), 'public', 'uploads');
            await mkdir(uploadDir, { recursive: true });

            for (const file of newImageFiles) {
                if (file.size > 0 && file.name !== 'undefined') {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                    const filename = `${uniqueSuffix}-${safeName}`;
                    const filepath = join(uploadDir, filename);

                    await writeFile(filepath, buffer);
                    newImageUrls.push(`/uploads/${filename}`);
                }
            }
        }

        const finalImages = [...existingImages, ...newImageUrls];

        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                priceNet,
                vatRate,
                discountPercent,
                stock,
                ean,
                manufacturerCode,
                weight,
                height,
                width,
                depth,
                packaging,
                isConfigurable,
                images: finalImages
            }
        });

        revalidateTag('products', 'max');
        revalidatePath('/admin/products', 'page');
        revalidatePath(`/sklep/produkt`, 'page');
        return { success: true };

    } catch (error) {
        console.error("Update product failed:", error);
        return { error: "Błąd podczas edycji produktu." };
    }
}

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
            const isWebPackage = process.cwd().endsWith('web') || existsSync(join(process.cwd(), 'public'));

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

        revalidateTag('products', 'max');
        revalidatePath('/admin/products', 'page');
        return { success: true };
    } catch (error) {
        console.error("Delete product failed:", error);
        return { error: "Wystąpił błąd podczas usuwania produktu." };
    }
}

export async function updateProductDiscount(id: string, discountPercent: number) {
    try {
        await prisma.product.update({
            where: { id },
            data: { discountPercent }
        });
        revalidateTag('products', 'max');
        revalidatePath('/admin/products', 'page');
        revalidatePath(`/sklep/produkt`, 'page');
        return { success: true };
    } catch (error) {
        console.error("Update discount failed:", error);
        return { error: "Błąd aktualizacji rabatu." };
    }
}
