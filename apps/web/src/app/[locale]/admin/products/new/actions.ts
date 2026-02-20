'use server';

import { prisma } from '@bolglass/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
    console.log("createProduct action started");
    try {
        console.log("createProduct action - processing fields");
        const name = formData.get('name') as string;
        console.log("Product name:", name);
        const description = formData.get('description') as string;

        if (!name) return { error: "Nazwa produktu jest wymagana." };

        // Identifiers
        const ean = formData.get('ean') as string || null;
        const manufacturerCode = formData.get('manufacturerCode') as string || null;
        console.log("Identifiers:", { ean, manufacturerCode });

        // Pricing
        const priceNet = parseFloat(formData.get('priceNet') as string) || 0;
        const vatRate = parseInt(formData.get('vatRate') as string) || 23;
        const priceGross = priceNet * (1 + vatRate / 100);
        console.log("Pricing:", { priceNet, vatRate, priceGross });

        // Logistics
        const weight = parseFloat(formData.get('weight') as string) || 0;
        const height = parseFloat(formData.get('height') as string) || 0;
        const width = parseFloat(formData.get('width') as string) || 0;
        const depth = parseFloat(formData.get('depth') as string) || 0;
        const packaging = formData.get('packaging') as string;
        console.log("Logistics:", { weight, height, width, depth, packaging });

        const isConfigurable = formData.get('isConfigurable') === 'on';

        const discountPercent = parseInt(formData.get('discountPercent') as string || '0');
        const stock = parseInt(formData.get('stock') as string || '0');
        console.log("isConfigurable:", isConfigurable);

        // Handle Multiple Images
        const files = formData.getAll('images') as File[];
        const imageUrls: string[] = [];
        console.log("Files received:", files.length);

        // Robust path handling for Monorepo + Docker
        // Check if we are already in apps/web (standard Next.js start) or root (Turbo dev)
        const isWebPackage = process.cwd().endsWith('web') || existsSync(join(process.cwd(), 'public'));

        const uploadDir = isWebPackage
            ? join(process.cwd(), 'public', 'uploads')
            : join(process.cwd(), 'apps', 'web', 'public', 'uploads');

        console.log("Upload directory resolved to:", uploadDir);

        try {
            console.log("Creating upload directory...");
            await mkdir(uploadDir, { recursive: true });

            // Write a test file to verify path accessibility
            await writeFile(join(uploadDir, 'test.txt'), 'Uploads directory is writable!');

            for (const file of files) {
                if (file.size > 0) {
                    console.log(`Processing file: ${file.name}, size: ${file.size}`);
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);

                    // Resize and optimize with sharp
                    // We need to dynamically require sharp to avoid build issues if it's missing in some envs
                    // though we added it to package.json
                    let processedBuffer = buffer;
                    let extension = '.jpg';

                    // Sanitize and Unique filename
                    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '').replace(/\.[^/.]+$/, "");
                    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}.jpg`; // Extension is .jpg from client compression
                    const filepath = join(uploadDir, filename);

                    // Simple file write - compression is now client-side
                    console.log(`Writing file to: ${filepath}`);
                    await writeFile(filepath, buffer);
                    imageUrls.push(`/uploads/${filename}`);
                }
            }
            console.log("Finished processing images. URLs:", imageUrls);
        } catch (error) {
            console.error("Upload process failed:", error);
            // We continue even if upload fails
        }

        // Generate a simple slug from name
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const sku = `BG-${Math.floor(Math.random() * 10000)}`;
        console.log("Generated SKU/Slug:", { sku, slug });

        console.log("Attempting to create product in Prisma...");
        await prisma.product.create({
            data: {
                name,
                description,
                ean,
                manufacturerCode,
                priceNet,
                vatRate,
                price: priceGross, // Mapping internal priceGross to schema field 'price'
                weight,
                height,
                width,
                depth,
                packaging,
                isConfigurable,
                discountPercent,
                stock,
                images: imageUrls, // Mapping internal imageUrls to schema field 'images'
                slug: `${slug}-${Date.now()}`, // Keep the unique slug generation
                sku,
            }
        });

        revalidateTag('products', 'max');
        revalidatePath('/admin/products', 'page');
        return { success: true };
    } catch (error: unknown) {
        console.error("Create product failed:", error);

        const prismaError = error as { code?: string; meta?: { target?: string[] } };
        if (prismaError.code === 'P2002') {
            const target = prismaError.meta?.target || [];
            if (target.includes('ean')) return { error: "Produkt z tym kodem EAN już istnieje." };
            if (target.includes('sku')) return { error: "Produkt z tym kodem SKU już istnieje." };
        }

        return { error: "Wystąpił błąd podczas zapisywania produktu w bazie danych." };
    }
}
