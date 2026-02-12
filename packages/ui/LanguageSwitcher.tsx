'use client';

import React from 'react';

interface LanguageSwitcherProps {
    currentLocale?: string;
    onLocaleChange: (locale: string) => void;
    locales: { code: string; label: string }[];
}

export function LanguageSwitcher({ onLocaleChange, locales }: LanguageSwitcherProps) {
    return (
        <div className="flex gap-2 z-50">
            {locales.map((locale) => (
                <button
                    key={locale.code}
                    onClick={() => onLocaleChange(locale.code)}
                    className="px-3 py-1 bg-white/10 backdrop-blur text-white rounded hover:bg-white/20 transition-colors uppercase text-sm font-medium"
                >
                    {locale.label}
                </button>
            ))}
        </div>
    );
}
