import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;
    const filename = pathSegments.join('/');

    // Robust path handling for Monorepo + Docker (copied from actions.ts)
    const isWebPackage = process.cwd().endsWith('web') || require('fs').existsSync(join(process.cwd(), 'public'));

    const uploadDir = isWebPackage
        ? join(process.cwd(), 'public', 'uploads')
        : join(process.cwd(), 'apps', 'web', 'public', 'uploads');

    const filePath = join(uploadDir, ...pathSegments);

    try {
        await stat(filePath); // Check if exists
        const fileBuffer = await readFile(filePath);

        // Determine content type
        const ext = pathSegments[pathSegments.length - 1].split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';

        // Images
        if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'gif') contentType = 'image/gif';
        else if (ext === 'webp') contentType = 'image/webp';

        // Videos
        else if (ext === 'mp4') contentType = 'video/mp4';
        else if (ext === 'mov') contentType = 'video/quicktime';
        else if (ext === 'm4v') contentType = 'video/x-m4v';
        else if (ext === 'webm') contentType = 'video/webm';

        // Other
        else if (ext === 'txt') contentType = 'text/plain';

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
