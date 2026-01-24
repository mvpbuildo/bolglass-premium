'use client';

import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();

    const changeLanguage = (locale: string) => {
        router.replace(pathname, { locale });
    };

    return (
        <div className="flex gap-2 z-50">
            <button onClick={() => changeLanguage('pl')} className="px-3 py-1 bg-white/10 backdrop-blur text-white rounded hover:bg-white/20">PL</button>
            <button onClick={() => changeLanguage('en')} className="px-3 py-1 bg-white/10 backdrop-blur text-white rounded hover:bg-white/20">EN</button>
            <button onClick={() => changeLanguage('de')} className="px-3 py-1 bg-white/10 backdrop-blur text-white rounded hover:bg-white/20">DE</button>
        </div>
    );
}
