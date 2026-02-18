
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitizing filename
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalFilename = `${uniqueSuffix}-${filename}`;

    // Ensure public/uploads exists (or handle error)
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, finalFilename);

    try {
        // In production (VPS), we need to ensure this directory exists.
        // Docker volume handles persistence.
        // For now, simpler to assume it exists or use try/catch in fs.
        await writeFile(filepath, buffer);

        // Return relative URL
        // Assuming process.env.AUTH_URL or similar is base, but we return relative for img src
        const url = `/uploads/${finalFilename}`;

        return NextResponse.json({ success: true, url });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
