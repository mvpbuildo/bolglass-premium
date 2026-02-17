export interface GalleryItem {
    id: string;
    title: string | null;
    description: string | null;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    category: string;
    displayHome: boolean;
    order: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}
