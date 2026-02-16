import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const isWebPackage = process.cwd().endsWith('web') || require('fs').existsSync(join(process.cwd(), 'public'));

        const uploadDir = isWebPackage
            ? join(process.cwd(), 'public', 'uploads')
            : join(process.cwd(), 'apps', 'web', 'public', 'uploads');

        const files = await readdir(uploadDir);

        const fileDetails = await Promise.all(files.map(async (file) => {
            try {
                const stats = await stat(join(uploadDir, file));
                return {
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    mode: stats.mode,
                    uid: stats.uid,
                    gid: stats.gid,
                };
            } catch (err) {
                return { name: file, error: 'Stat failed' };
            }
        }));

        return NextResponse.json({
            cwd: process.cwd(),
            uploadDir,
            filesCount: files.length,
            files: fileDetails
        });
    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to read uploads directory',
            details: error.message,
            cwd: process.cwd()
        }, { status: 500 });
    }
}
