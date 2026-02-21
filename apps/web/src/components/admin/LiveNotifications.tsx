'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function LiveNotifications() {
    const lastCheckTime = useRef<Date>(new Date());
    const initialCheckDone = useRef(false);

    useEffect(() => {
        // Opóźniamy pierwszy strzał, aby powiadomienia nie wchodziły razem z ładowaniem layoutu
        const initialTimer = setTimeout(() => {
            lastCheckTime.current = new Date();
            initialCheckDone.current = true;
        }, 1000);

        const pollTimer = setInterval(async () => {
            if (!initialCheckDone.current) return;

            try {
                const since = lastCheckTime.current.toISOString();
                // Oznaczamy czas DOKŁADNIE PRZED strzałem, by nie zgubić transakcji w czasie opóźnień asynchronicznych
                const nextCheckTime = new Date();

                const response = await fetch(`/api/admin/notifications?since=${since}`);
                if (!response.ok) return;

                const data = await response.json();

                if (data.orders > 0) {
                    toast.success(`Nowe zamówienia w sklepie: ${data.orders}! Sprawdź zakładkę Zamówienia.`, {
                        duration: 6000,
                        icon: '📦',
                    });
                }

                if (data.bookings > 0) {
                    toast.success(`Nowe rezerwacje kalendarzowe: ${data.bookings}! Sprawdź terminarz.`, {
                        duration: 6000,
                        icon: '📅',
                    });
                }

                lastCheckTime.current = nextCheckTime;

            } catch (e) {
                // ignorujemy błędy połączeniowe w tle
            }
        }, 20000); // 20 sekund

        return () => {
            clearTimeout(initialTimer);
            clearInterval(pollTimer);
        };
    }, []);

    return null; // Komponent-widmo (bez interfejsu)
}
