'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getGalleryItems,
    getGalleryAlbums,
    uploadGalleryMedia,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    createGalleryAlbum,
    deleteGalleryAlbum
} from './actions';
import { Card, Button } from '@bolglass/ui';
import { toast } from 'sonner';
import { GalleryItem, GalleryAlbum } from '@/types/gallery';
import { Trash2 as TrashIcon, Edit, Plus as PlusIcon, FolderPlus, Image as ImageIcon, Video as VideoIcon, Home as HomeIcon, Folder as FolderIcon, Loader2, Save, X } from 'lucide-react';
import Image from 'next/image';

export default function GalleryManager() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'ITEMS' | 'ALBUMS'>('ITEMS');

    // Form state for Items
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        type: 'IMAGE' as const,
        category: 'GENERAL',
        displayHome: false,
        albumId: ''
    });

    // Form state for Albums
    const [isAddingAlbum, setIsAddingAlbum] = useState(false);
    const [newAlbum, setNewAlbum] = useState({
        title: '',
        description: '',
        category: 'GENERAL'
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [itemsData, albumsData] = await Promise.all([
            getGalleryItems(),
            getGalleryAlbums()
        ]);
        setItems(itemsData as GalleryItem[]);
        setAlbums(albumsData as GalleryAlbum[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                order: items.length,
                albumId: newItem.albumId || undefined
            });
            setIsAddingItem(false);
            setNewItem({ title: '', description: '', type: 'IMAGE', category: 'GENERAL', displayHome: false, albumId: '' });
            fetchData();
        } else {
            toast.error('Przesyłanie nieudane: ' + (result.error || 'Nieznany błąd'));
        }
        setUploading(false);
    };

    const handleCreateAlbum = async () => {
        if (!newAlbum.title) {
            toast.error('Tytuł albumu jest wymagany');
            return;
        }
        const result = await createGalleryAlbum(newAlbum);
        if (result.success) {
            setIsAddingAlbum(false);
            setNewAlbum({ title: '', description: '', category: 'GENERAL' });
            fetchData();
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten element?')) return;
        const result = await deleteGalleryItem(id);
        if (result.success) fetchData();
    };

    const handleDeleteAlbum = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten folder? Przed usunięciem upewnij się, że jest pusty.')) return;
        const result = await deleteGalleryAlbum(id);
        if (result.success) fetchData();
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
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('ITEMS')}
                        className={`text-xl font-bold pb-2 border-b-2 transition-colors ${activeTab === 'ITEMS' ? 'text-orange-600 border-orange-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                    >
                        Pojedyncze Media
                    </button>
                    <button
                        onClick={() => setActiveTab('ALBUMS')}
                        className={`text-xl font-bold pb-2 border-b-2 transition-colors ${activeTab === 'ALBUMS' ? 'text-orange-600 border-orange-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                    >
                        Foldery (Albumy)
                    </button>
                </div>
            </div>

            {/* TAB: ITEMS */}
            {activeTab === 'ITEMS' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setIsAddingItem(!isAddingItem)}
                            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Dodaj Media
                        </Button>
                    </div>

                    {isAddingItem && (
                        <Card className="p-6 border-2 border-orange-100 bg-orange-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tytuł</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg"
                                            value={newItem.title}
                                            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                            placeholder="np. Wydmuchiwanie bożonarodzeniowej bombki"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Opis (pokazuje się na stronie)</label>
                                        <textarea
                                            className="w-full px-3 py-2 border rounded-lg"
                                            rows={2}
                                            value={newItem.description}
                                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                            placeholder="Szybki opis procesu lub realizacji..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Kategoria</label>
                                            <select
                                                title="Wybierz kategorię"
                                                className="w-full px-3 py-2 border rounded-lg"
                                                value={newItem.category}
                                                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                            >
                                                <option value="GENERAL">Ogólna</option>
                                                <option value="PRODUCTION">Produkcja</option>
                                                <option value="REALIZATIONS">Realizacje</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Folder (Album)</label>
                                            <select
                                                title="Wybierz album"
                                                className="w-full px-3 py-2 border rounded-lg"
                                                value={newItem.albumId}
                                                onChange={e => setNewItem({ ...newItem, albumId: e.target.value })}
                                            >
                                                <option value="">Brak (Luzem)</option>
                                                {albums.map(album => (
                                                    <option key={album.id} value={album.id}>{album.title}</option>
                                                ))}
                                            </select>
                                        </div>
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
                                            <label htmlFor="media-upload" className="cursor-pointer text-center group">
                                                <div className="bg-orange-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                                    <PlusIcon className="w-8 h-8 text-orange-600" />
                                                </div>
                                                <p className="font-bold text-gray-900">Kliknij aby wybrać plik</p>
                                                <p className="text-xs text-gray-500 mt-1">Automatycznie zapisze element po wybraniu</p>
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
                                            <video src={item.url} className="absolute inset-0 w-full h-full object-contain opacity-50 group-hover:opacity-70 transition-opacity" muted playsInline />
                                        </div>
                                    ) : (
                                        <Image src={item.url} alt={item.title || ''} fill className="object-contain" />
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toggleHome(item)}
                                            aria-label="Pokaż na stronie głównej"
                                            className={`p-2 rounded-lg backdrop-blur-md transition-colors ${item.displayHome ? 'bg-orange-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                                        >
                                            <HomeIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            aria-label="Usuń element"
                                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 flex gap-1">
                                        <div className="px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded uppercase backdrop-blur-sm">
                                            {item.category}
                                        </div>
                                        {item.albumId && (
                                            <div className="px-2 py-1 bg-orange-600/70 text-white text-[10px] font-bold rounded uppercase backdrop-blur-sm flex items-center gap-1">
                                                <FolderIcon className="w-2.5 h-2.5" />
                                                {albums.find(a => a.id === item.albumId)?.title}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 truncate">{item.title || 'Bez tytułu'}</h4>
                                    {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">&quot;{item.description}&quot;</p>}
                                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 uppercase font-bold tracking-tighter">
                                        {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: ALBUMS */}
            {activeTab === 'ALBUMS' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setIsAddingAlbum(!isAddingAlbum)}
                            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Stwórz Folder
                        </Button>
                    </div>

                    {isAddingAlbum && (
                        <Card className="p-6 border-2 border-orange-100 bg-orange-50/30 max-w-2xl mx-auto">
                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <PlusIcon className="w-5 h-5 text-orange-600" />
                                Nowy Folder (Album)
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tytuł Folderu</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={newAlbum.title}
                                        onChange={e => setNewAlbum({ ...newAlbum, title: e.target.value })}
                                        placeholder="np. Realizacje 2024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Opis Galerii (pokazuje się przed zdjęciami)</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg"
                                        rows={3}
                                        value={newAlbum.description}
                                        onChange={e => setNewAlbum({ ...newAlbum, description: e.target.value })}
                                        placeholder="Krótki wstęp do tej kolekcji zdjęć..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsAddingAlbum(false)}>Anuluj</Button>
                                    <Button onClick={handleCreateAlbum} className="bg-orange-600 hover:bg-orange-700">Stwórz Folder</Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {albums.map(album => (
                            <Card key={album.id} className="p-4 flex gap-4 hover:shadow-md transition-shadow">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                                    {album.items && album.items[0] ? (
                                        <Image
                                            src={album.items[0].url}
                                            alt={album.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <FolderIcon className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">{album.title}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{album.description || 'Brak opisu'}</p>
                                        <div className="mt-2 text-[10px] font-bold text-orange-600 px-2 py-1 bg-orange-50 rounded-full inline-block uppercase">
                                            {album.items?.length || 0} Elementów
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleDeleteAlbum(album.id)}
                                            aria-label="Usuń folder"
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            title="Usuń Folder"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
