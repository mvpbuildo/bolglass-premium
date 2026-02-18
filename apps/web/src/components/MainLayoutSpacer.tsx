'use client';

import { usePathname } from 'next/navigation';

export default function MainLayoutSpacer() {
    const pathname = usePathname();

    // Check if we are on the homepage
    const isHome = pathname === '/' || pathname === '/pl' || pathname === '/en' || pathname === '/de';

    if (isHome) {
        return null;
    }

    // Return a spacer div to push content down below the fixed navbar
    // h-28 = 112px, sufficient to clear the 80px-100px navbar
    return <div className="h-28 w-full" />;
}
