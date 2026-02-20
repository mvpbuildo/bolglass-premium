'use server';

import { prisma } from '@bolglass/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateProduct(id: string, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        if (!name) return { error: "Nazwa produktu jest wymagana." };

        // Identifiers
        const ean = formData.get('ean') as string || null;
        const manufacturerCode = formData.get('manufacturerCode') as string || null;

        // Pricing
        const priceNet = parseFloat(formData.get('priceNet') as string) || 0;
        const vatRate = parseInt(formData.get('vatRate') as string) || 23;
        const priceGross = priceNet * (1 + vatRate / 100);

        // Logistics
        const weight = parseFloat(formData.get('weight') as string) || 0;
        const height = parseFloat(formData.get('height') as string) || 0;
        const width = parseFloat(formData.get('width') as string) || 0;
        const depth = parseFloat(formData.get('depth') as string) || 0;
        const packaging = formData.get('packaging') as string;

        const isConfigurable = formData.get('isConfigurable') === 'on';

        const discountPercent = parseInt(formData.get('discountPercent') as string || '0');
        const stock = parseInt(formData.get('stock') as string || '0');

        // Existing Images (passed as JSON string array)
        const existingImagesStr = formData.get('existingImages') as string;
        const existingImages: string[] = existingImagesStr ? JSON.parse(existingImagesStr) : [];

        // Handle NEW Images
        const files = formData.getAll('newImages') as File[];
        const newImageUrls: string[] = [];

        // Robust path handling for Monorepo + Docker
        // Check if we are already in apps/web (standard Next.js start) or root (Turbo dev)
        const isWebPackage = process.cwd().endsWith('web') || require('fs').existsSync(join(process.cwd(), 'public'));

        const uploadDir = isWebPackage
            ? join(process.cwd(), 'public', 'uploads')
            : join(process.cwd(), 'apps', 'web', 'public', 'uploads');

        try {
            await mkdir(uploadDir, { recursive: true });

            for (const file of files) {
                if (file.size > 0) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);

                    // Sanitize and Unique filename
                    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '').replace(/\.[^/.]+$/, "");
                    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}.jpg`; // Extension is .jpg from client compression
                    const filepath = join(uploadDir, filename);

                    // Simple file write - compression is now client-side
                    await writeFile(filepath, buffer);
                    newImageUrls.push(`/uploads/${filename}`);
                }
            }
        } catch (error) {
            console.error("Upload process failed:", error);
        }

        // Combine existing and new images
        const finalImages = [...existingImages, ...newImageUrls];

        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                ean,
                manufacturerCode,
                priceNet,
                vatRate,
                price: priceGross,
                weight,
                height,
                width,
                depth,
                packaging,
                isConfigurable,
                discountPercent,
                stock,
                images: finalImages,
            }
        });

        revalidateTag('products');
        revalidatePath('/admin/products', 'page');
        revalidatePath(`/admin/products/${id}`, 'page');

        return { success: true };
    } catch (error: unknown) {
        console.error("Update product failed:", error);

        const prismaError = error as { code?: string; meta?: { target?: string[] } };
        if (prismaError.code === 'P2002') {
            const target = prismaError.meta?.target || [];
            if (target.includes('ean')) return { error: "Produkt z tym kodem EAN już istnieje." };
        }

        return { error: "Wystąpił błąd podczas aktualizacji produktu." };
    }
}
