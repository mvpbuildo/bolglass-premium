'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { LanguageSwitcher as SharedLanguageSwitcher } from '@bolglass/ui';

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (locale: string) => {
        router.replace(pathname, { locale });
    };

    const locales = [
        { code: 'pl', label: 'PL' },
        { code: 'en', label: 'EN' },
        { code: 'de', label: 'DE' }
    ];

    return <SharedLanguageSwitcher onLocaleChange={handleLocaleChange} locales={locales} />;
}
