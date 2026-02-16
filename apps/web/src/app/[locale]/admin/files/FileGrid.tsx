'use client';

import { Card, Button } from '@bolglass/ui';
import { deleteFile } from './actions';
import { Trash2, File, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface FileGridProps {
    files: any[];
}

export default function FileGrid({ files }: FileGridProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (fileName: string) => {
        if (confirm(`Czy na pewno chcesz usunąć plik ${fileName}?`)) {
            try {
                setIsDeleting(fileName);
                await deleteFile(fileName);
            } catch (error: any) {
                alert(error.message || 'Błąd podczas usuwania pliku');
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const isImage = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '');
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file) => (
                <Card key={file.name} className="overflow-hidden group hover:shadow-lg transition-all border-gray-200">
                    <div className="aspect-video bg-gray-50 flex items-center justify-center relative overflow-hidden ring-1 ring-black/5">
                        {isImage(file.name) ? (
                            <>
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform">
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                </div>
                            </>
                        ) : (
                            <File className="w-12 h-12 text-gray-300" />
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(file.name)}
                                disabled={isDeleting === file.name}
                                className="bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 h-8 w-8 p-0 rounded-lg shadow-sm backdrop-blur-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm truncate mb-1" title={file.name}>
                            {file.name}
                        </h3>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>{format(new Date(file.createdAt), 'dd.MM.yyyy')}</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
