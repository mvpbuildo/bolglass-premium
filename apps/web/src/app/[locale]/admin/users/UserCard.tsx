'use client';

import { Button, Card } from '@bolglass/ui';
import { toggleUserRole, deleteUser } from './actions';
import { useState } from 'react';

interface UserCardProps {
    user: any;
    currentUserId?: string;
}

export default function UserCard({ user, currentUserId }: UserCardProps) {
    const [isPending, setIsPending] = useState(false);

    const handleToggleRole = async () => {
        try {
            setIsPending(true);
            await toggleUserRole(user.id, user.role);
        } catch (error: any) {
            alert(error.message || 'Błąd podczas zmiany roli');
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        if (confirm(`Czy na pewno chcesz usunąć użytkownika ${user.email}? Tej operacji nie można cofnąć.`)) {
            try {
                setIsPending(true);
                await deleteUser(user.id);
            } catch (error: any) {
                alert(error.message || 'Błąd podczas usuwania użytkownika');
            } finally {
                setIsPending(false);
            }
        }
    };

    return (
        <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {user.image ? (
                    <img src={user.image} alt={user.name || ''} className="w-10 h-10 rounded-full" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {user.name?.[0] || '?'}
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        {user.name}
                        {user.role === 'ADMIN' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] uppercase font-bold rounded-full">Admin</span>
                        )}
                        {user.id === currentUserId && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full">Ty</span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    onClick={handleToggleRole}
                    variant="outline"
                    disabled={user.id === currentUserId || isPending}
                    className={`
                        text-xs font-bold
                        ${user.role === 'ADMIN'
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-purple-600 border-purple-200 hover:bg-purple-50'}
                        ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {user.role === 'ADMIN' ? 'Zabierz Admina ⬇️' : 'Daj Admina ⬆️'}
                </Button>

                <Button
                    onClick={handleDelete}
                    variant="ghost"
                    disabled={user.id === currentUserId || isPending}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Usuń użytkownika"
                >
                    🗑️
                </Button>
            </div>
        </Card>
    );
}
