'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Package, Calendar } from 'lucide-react';

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
                    toast.success(`Nowe zamówienia: ${data.orders}`, {
                        description: 'Sprawdź zakładkę Zamówienia w panelu.',
                        icon: <Package className="w-5 h-5 text-emerald-500" />,
                        duration: 8000
                    });
                }

                if (data.bookings > 0) {
                    toast.info(`Nowe rezerwacje: ${data.bookings}`, {
                        description: 'Sprawdź terminarz warsztatów.',
                        icon: <Calendar className="w-5 h-5 text-blue-500" />,
                        duration: 8000
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
