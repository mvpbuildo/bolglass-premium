'use client';

import { toast } from 'sonner';
import { toggleTelegramPermission } from './actions';
import { useState, useTransition } from 'react';

interface PermissionToggleProps {
    id: string;
    field: 'receivesOrders' | 'receivesBookings' | 'receivesLogistics';
    initialValue: boolean;
    label: string;
    icon: React.ReactNode;
    activeColor: string;
}

export default function PermissionToggle({ id, field, initialValue, label, icon, activeColor }: PermissionToggleProps) {
    const [isPending, startTransition] = useTransition();
    const [checked, setChecked] = useState(initialValue);

    const handleToggle = () => {
        const newValue = !checked;
        setChecked(newValue);

        startTransition(async () => {
            try {
                await toggleTelegramPermission(id, field, newValue);
                toast.success(`Uprawnienie "${label}" zostało zaktualizowane.`);
            } catch (error) {
                setChecked(!newValue); // Rollback
                toast.error('Nie udało się zaktualizować uprawnienia.');
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded-md transition-all border ${checked
                    ? `${activeColor} border-current bg-white shadow-sm`
                    : 'text-gray-400 border-gray-100 hover:border-gray-200 grayscale opacity-60'
                } ${isPending ? 'animate-pulse' : ''}`}
        >
            {icon}
            {label}
        </button>
    );
}
