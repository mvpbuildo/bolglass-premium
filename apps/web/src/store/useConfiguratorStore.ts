'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ConfiguratorState {
    size: 'small' | 'medium' | 'large';
    color: string;
    text: string;
    font: string;
    previewUrl: string | null;

    // Actions
    setSize: (size: 'small' | 'medium' | 'large') => void;
    setColor: (color: string) => void;
    setText: (text: string) => void;
    setFont: (font: string) => void;
    setPreviewUrl: (url: string | null) => void;
    reset: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>()(
    devtools(
        (set) => ({
            size: 'medium',
            color: '#ffffff',
            text: '',
            font: 'classic',
            previewUrl: null,

            setSize: (size) => set({ size }, false, 'setSize'),
            setColor: (color) => set({ color }, false, 'setColor'),
            setText: (text) => set({ text }, false, 'setText'),
            setFont: (font) => set({ font }, false, 'setFont'),
            setPreviewUrl: (previewUrl) => set({ previewUrl }, false, 'setPreviewUrl'),

            reset: () => set({
                size: 'medium',
                color: '#ffffff',
                text: '',
                font: 'classic',
                previewUrl: null
            }, false, 'reset'),
        }),
        { name: 'BaubleConfigurator' }
    )
);
