
import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // --- Validation Logic ---
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        const allowedVideoTypes = ['video/mp4', 'video/webm'];
        const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                success: false,
                message: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
            }, { status: 400 });
        }

        const isVideo = allowedVideoTypes.includes(file.type);
        const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for images

        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                message: `File too large. Max size: ${maxSize / (1024 * 1024)}MB`
            }, { status: 400 });
        }
        // ------------------------

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitizing filename - stricter replacement
        // Keep only alphanumeric, dots, and dashes. Replace everything else with empty string or underscore.
        // Also limit length to avoid filesystem issues.
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const truncatedName = originalName.length > 50 ? originalName.substring(originalName.length - 50) : originalName;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const finalFilename = `${uniqueSuffix}-${truncatedName}`;

        // Ensure public/uploads exists (or handle error)
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, finalFilename);

        await writeFile(filepath, buffer);

        // Return relative URL
        const url = `/uploads/${finalFilename}`;

        return NextResponse.json({ success: true, url });
    } catch (err: any) {
        console.error('Upload error:', err);
        return NextResponse.json({ success: false, message: 'Upload failed: ' + err.message }, { status: 500 });
    }
}
