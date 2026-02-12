import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'de', 'pl'],

    // Used when no locale matches
    defaultLocale: 'pl'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will handle the setting of the `NEXT_LOCALE` cookie
export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
