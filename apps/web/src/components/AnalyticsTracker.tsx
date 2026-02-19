'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackVisit } from '@/app/[locale]/actions';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double tracking in strict mode or dev
        if (initialized.current) return;
        initialized.current = true;

        // Session storage check to count "sessions" or "unique daily visits" somewhat?
        // Simple logic: If no session flag for today, track visit.
        const today = new Date().toISOString().split('T')[0];
        const lastVisit = sessionStorage.getItem('bol_visit_date');

        if (lastVisit !== today) {
            trackVisit().then(() => {
                sessionStorage.setItem('bol_visit_date', today);
                console.log('Use Analytics: Visit tracked for', today);
            });
        }
    }, [pathname]); // actually run on mount only? Or on route change?
    // If we want PAGE VIEWS, we run on [pathname].
    // If we want VISITS (Sessions), we run on mount/sessionStorage.
    // User asked for "Visit Tracking" but schema says "views". 
    // Let's track VISITS (daily unique per user session) to not inflate with every click.
    // So dependency array should be empty [] to run once per app load/refresh.
    // But navigating client-side doesn't remount layout.
    // So sticking to [pathname] would count page views.
    // Sticking to [] counts session start.
    // Implementation above uses sessionStorage to gate it to once per session/day.
    // So it effectively counts "Daily Unique Users" (roughly).

    return null;
}
