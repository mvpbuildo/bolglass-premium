import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Robust path handling for Monorepo + Docker (copied from actions.ts)
    const isWebPackage = process.cwd().endsWith('web') || require('fs').existsSync(join(process.cwd(), 'public'));

    const uploadDir = isWebPackage
        ? join(process.cwd(), 'public', 'uploads')
        : join(process.cwd(), 'apps', 'web', 'public', 'uploads');

    const filePath = join(uploadDir, filename);

    try {
        await stat(filePath); // Check if exists
        const fileBuffer = await readFile(filePath);

        // Determine content type
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        if (ext === 'png') contentType = 'image/png';
        if (ext === 'gif') contentType = 'image/gif';
        if (ext === 'webp') contentType = 'image/webp';
        if (ext === 'txt') contentType = 'text/plain';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error(`Error serving file ${filename}:`, error);
        return new NextResponse('File not found', { status: 404 });
    }
}
