export interface GalleryItem {
    id: string;
    title: string | null;
    description: string | null;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    category: string;
    displayHome: boolean;
    order: number;
    albumId?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface GalleryAlbum {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    category: string;
    order: number;
    items?: GalleryItem[];
    createdAt: Date | string;
    updatedAt: Date | string;
}
