import { listFiles } from './actions';
import FileGrid from './FileGrid';
import { Card } from '@bolglass/ui';
import { Files } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminFilesPage() {
    const files = await listFiles();

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">

                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Files className="w-6 h-6 text-cyan-600" />
                            Zasoby i Pliki
                        </h2>
                        <p className="text-gray-500 text-sm">Zarządzaj multimediami w folderze <code>public/uploads</code></p>
                    </div>
                </div>

                {files.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Files className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Brak plików w katalogu uploads</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Zacznij przesyłać zdjęcia produktów lub realizacji, a pojawią się one w tym miejscu.
                        </p>
                    </Card>
                ) : (
                    <FileGrid files={files} />
                )}
            </div>
        </main>
    );
}
