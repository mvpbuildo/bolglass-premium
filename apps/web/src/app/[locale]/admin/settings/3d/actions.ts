'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

const CONFIG_KEY = 'bauble_config';

export type MultilingualLabel = {
    pl: string;
    en: string;
    de: string;
};

export type BaubleSize = {
    id: string;
    label: string | MultilingualLabel;
    basePrice: number;
    scale: number;
};

export type BaubleColor = {
    hex: string;
    name: string | MultilingualLabel;
    price: number;
};

export type BaubleConfig = {
    sizes: BaubleSize[];
    colors: BaubleColor[];
    addons: {
        textPrice: number;
    };
};

const DEFAULT_CONFIG: BaubleConfig = {
    sizes: [
        { id: "8cm", label: { pl: "Ø 8cm", en: "Ø 8cm", de: "Ø 8cm" }, basePrice: 29.99, scale: 0.8 },
        { id: "10cm", label: { pl: "Ø 10cm", en: "Ø 10cm", de: "Ø 10cm" }, basePrice: 34.99, scale: 1.0 },
        { id: "12cm", label: { pl: "Ø 12cm", en: "Ø 12cm", de: "Ø 12cm" }, basePrice: 44.99, scale: 1.2 },
        { id: "15cm", label: { pl: "Ø 15cm", en: "Ø 15cm", de: "Ø 15cm" }, basePrice: 59.99, scale: 1.5 }
    ],
    colors: [
        { hex: '#D91A1A', name: { pl: 'Czerwień Królewska', en: 'Royal Red', de: 'Königliches Rot' }, price: 0 },
        { hex: '#1E40AF', name: { pl: 'Głębia Oceanu', en: 'Ocean Deep', de: 'Ozeantief' }, price: 0 },
        { hex: '#047857', name: { pl: 'Szmaragdowy Las', en: 'Emerald Forest', de: 'Smaragdwald' }, price: 0 },
        { hex: '#F59E0B', name: { pl: 'Złoty Bursztyn', en: 'Golden Amber', de: 'Goldener Bernstein' }, price: 5 },
        { hex: '#FCD34D', name: { pl: 'Jasne Złoto', en: 'Light Gold', de: 'Hellgold' }, price: 5 },
        { hex: '#9333EA', name: { pl: 'Purpura Władców', en: 'Regal Purple', de: 'Königliches Purpur' }, price: 5 }
    ],
    addons: {
        textPrice: 10
    }
};

export const getConfiguratorSettings = unstable_cache(
    async (): Promise<BaubleConfig> => {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: CONFIG_KEY }
        });

        if (!setting) {
            return DEFAULT_CONFIG;
        }

        try {
            const config = JSON.parse(setting.value) as BaubleConfig;

            // Normalize old configs to MultilingualLabel
            config.sizes = config.sizes.map(s => ({
                ...s,
                label: typeof s.label === 'string' ? { pl: s.label, en: s.label, de: s.label } : s.label
            }));

            config.colors = config.colors.map(c => ({
                ...c,
                name: typeof c.name === 'string' ? { pl: c.name, en: c.name, de: c.name } : c.name
            }));

            return config;
        } catch (error) {
            console.error('Failed to parse bauble config:', error);
            return DEFAULT_CONFIG;
        }
    },
    ['bauble-config-cache'],
    { tags: ['bauble-config'], revalidate: 3600 }
);

export async function updateConfiguratorSettings(config: BaubleConfig) {
    await prisma.systemSetting.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(config) },
        create: { key: CONFIG_KEY, value: JSON.stringify(config) }
    });

    revalidateTag('bauble-config', 'max');
    revalidatePath('/[locale]/admin/settings/3d', 'page');
    revalidatePath('/[locale]', 'layout'); // Revalidate potential cached pages using config
}
