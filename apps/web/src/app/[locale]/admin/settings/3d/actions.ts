'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';

const CONFIG_KEY = 'bauble_config';

export type BaubleSize = {
    id: string;
    label: string;
    basePrice: number;
    scale: number;
};

export type BaubleColor = {
    hex: string;
    name: string;
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
        { id: "8cm", label: "Ø 8cm", basePrice: 29.99, scale: 0.8 },
        { id: "10cm", label: "Ø 10cm", basePrice: 34.99, scale: 1.0 },
        { id: "12cm", label: "Ø 12cm", basePrice: 44.99, "scale": 1.2 },
        { id: "15cm", label: "Ø 15cm", basePrice: 59.99, "scale": 1.5 }
    ],
    colors: [
        { hex: '#D91A1A', name: 'Czerwień Królewska', price: 0 },
        { hex: '#1E40AF', name: 'Głębia Oceanu', price: 0 },
        { hex: '#047857', name: 'Szmaragdowy Las', price: 0 },
        { hex: '#F59E0B', name: 'Złoty Bursztyn', price: 5 },
        { hex: '#FCD34D', name: 'Jasne Złoto', price: 5 },
        { hex: '#9333EA', name: 'Purpura Władców', price: 5 }
    ],
    addons: {
        textPrice: 10
    }
};

export async function getConfiguratorSettings(): Promise<BaubleConfig> {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: CONFIG_KEY }
    });

    if (!setting) {
        return DEFAULT_CONFIG;
    }

    try {
        return JSON.parse(setting.value) as BaubleConfig;
    } catch (error) {
        console.error('Failed to parse bauble config:', error);
        return DEFAULT_CONFIG;
    }
}

export async function updateConfiguratorSettings(config: BaubleConfig) {
    await prisma.systemSetting.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(config) },
        create: { key: CONFIG_KEY, value: JSON.stringify(config) }
    });

    revalidatePath('/[locale]/admin/settings/3d', 'page');
    revalidatePath('/[locale]', 'layout'); // Revalidate potential cached pages using config
}
