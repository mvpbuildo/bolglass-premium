'use client';

import { Card, Button } from '@bolglass/ui';
import { toggleUserRole, deleteUser } from './actions';
import { Shield, ShieldAlert, Trash2, Mail, Key } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserCardProps {
    user: any;
    isCurrentUser: boolean;
}

export default function UserCard({ user, isCurrentUser }: UserCardProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleToggleRole = async () => {
        try {
            setLoading('role');
            await toggleUserRole(user.id, user.role);
            toast.success('Rola użytkownika została zmieniona');
        } catch (error: any) {
            toast.error(error.message || 'Błąd podczas zmiany roli');
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async () => {
        if (confirm(`Czy na pewno chcesz usunąć użytkownika ${user.email}?`)) {
            try {
                setLoading('delete');
                await deleteUser(user.id);
                toast.success('Użytkownik został usunięty');
            } catch (error: any) {
                toast.error(error.message || 'Błąd podczas usuwania użytkownika');
            } finally {
                setLoading(null);
            }
        }
    };


    return (
        <Card className={`p-4 flex items-center justify-between group transition-all hover:shadow-md border-gray-200 ${isCurrentUser ? 'border-l-4 border-l-red-600 bg-red-50/10' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                        {user.image ? (
                            <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-black text-gray-400">
                                {user.name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-gray-100">
                        <Key className="w-4 h-4 text-gray-400 p-0.5" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{user.name || 'Użytkownik bez nazwy'}</h3>
                        {isCurrentUser && <span className="text-[10px] font-black text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded border border-red-100 tracking-tighter">TY</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Mail className="w-3 h-3" />
                        {user.email}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Uprawnienia</span>
                    <button
                        onClick={handleToggleRole}
                        disabled={isCurrentUser || !!loading}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all border shadow-sm
                            ${user.role === 'ADMIN'
                                ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                                : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'}
                        `}
                    >
                        {user.role === 'ADMIN' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {user.role}
                    </button>
                </div>

                <div className="flex items-center gap-2 border-l pl-4 border-gray-100 h-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isCurrentUser || !!loading}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors p-2"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
