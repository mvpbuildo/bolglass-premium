'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getGalleryItems,
    uploadGalleryMedia,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem
} from './actions';
import { Card, Button } from '@bolglass/ui';
import { GalleryItem } from '@/types/gallery';
import {
    ImageIcon,
    VideoIcon,
    PlusIcon,
    TrashIcon,
    HomeIcon,
    Loader2
} from 'lucide-react';
import Image from 'next/image';

export default function GalleryManager() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        type: 'IMAGE' as const,
        category: 'GENERAL',
        displayHome: false
    });

    const fetchItems = useCallback(async () => {
        setLoading(true);
        const data = await getGalleryItems();
        setItems(data as GalleryItem[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadGalleryMedia(formData);

        if (result.success && result.url) {
            await createGalleryItem({
                ...newItem,
                url: result.url,
                type: result.type as 'IMAGE' | 'VIDEO',
                order: items.length
            });
            setIsAdding(false);
            setNewItem({ title: '', description: '', type: 'IMAGE', category: 'GENERAL', displayHome: false });
            fetchItems();
        } else {
            alert('Upload failed: ' + (result.error || 'Unknown error'));
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten element?')) return;

        const result = await deleteGalleryItem(id);
        if (result.success) {
            fetchItems();
        }
    };

    const toggleHome = async (item: GalleryItem) => {
        const result = await updateGalleryItem(item.id, { displayHome: !item.displayHome });
        if (result.success) {
            setItems(items.map(i => i.id === item.id ? { ...i, displayHome: !i.displayHome } : i));
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Zasoby Galerii</h3>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                >
                    <PlusIcon className="w-4 h-4" />
                    Dodaj Media
                </Button>
            </div>

            {isAdding && (
                <Card className="p-6 border-2 border-orange-100 bg-orange-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tytuł (opcjonalnie)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="np. Wydmuchiwanie formy"
                                />
                            </div>
                            <div>
                                <label id="category-label" className="block text-sm font-bold text-gray-700 mb-1">Kategoria</label>
                                <select
                                    aria-labelledby="category-label"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                >
                                    <option value="GENERAL">Ogólna</option>
                                    <option value="PRODUCTION">Produkcja</option>
                                    <option value="REALIZATIONS">Realizacje</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="displayHome"
                                    className="w-4 h-4 text-orange-600"
                                    checked={newItem.displayHome}
                                    onChange={e => setNewItem({ ...newItem, displayHome: e.target.checked })}
                                />
                                <label htmlFor="displayHome" className="text-sm font-bold text-gray-700">Pokaż na stronie głównej</label>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-orange-200 rounded-xl bg-white">
                            {uploading ? (
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-600">Przesyłanie...</p>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        id="media-upload"
                                        className="hidden"
                                        accept="image/*,video/*"
                                        onChange={handleFileUpload}
                                    />
                                    <label
                                        htmlFor="media-upload"
                                        className="cursor-pointer text-center group"
                                    >
                                        <div className="bg-orange-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <PlusIcon className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <p className="font-bold text-gray-900">Kliknij aby wybrać plik</p>
                                        <p className="text-xs text-gray-500 mt-1">Obrazy lub filmy (MP4)</p>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="relative aspect-video bg-gray-100">
                            {item.type === 'VIDEO' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                    <VideoIcon className="w-12 h-12 text-white/50" />
                                    <video
                                        src={item.url}
                                        className="absolute inset-0 w-full h-full object-contain opacity-50 group-hover:opacity-70 transition-opacity"
                                        muted
                                        playsInline
                                    />
                                </div>
                            ) : (
                                <Image
                                    src={item.url}
                                    alt={item.title || ''}
                                    fill
                                    className="object-contain"
                                />
                            )}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => toggleHome(item)}
                                    className={`p-2 rounded-lg backdrop-blur-md transition-colors ${item.displayHome ? 'bg-orange-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                                    title="Pokaż na stronie głównej"
                                >
                                    <HomeIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    title="Usuń"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded uppercase tracking-wider backdrop-blur-sm">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-gray-900 truncate">{item.title || 'Bez tytułu'}</h4>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                {item.type === 'IMAGE' ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}
                                {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            {items.length === 0 && !isAdding && (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Galeria jest jeszcze pusta.</p>
                </div>
            )}
        </div>
    );
}
