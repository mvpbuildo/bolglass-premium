'use client';

import { useState } from 'react';
import { Card, Button } from "@bolglass/ui";
import { Settings, Trash2, AlertTriangle, Key, CheckCircle2 } from "lucide-react";
import { deleteCurrentUserAccount } from '../../actions';
import { changePassword } from './actions';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
    const t = useTranslations('Account.settings');

    // Delete Account states
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Password Change states
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const res = await deleteCurrentUserAccount();
            if (res.success) {
                await signOut({ callbackUrl: '/' });
            } else {
                setDeleteError(res.error || t('deleting'));
                setIsDeleting(false);
                setIsConfirmingDelete(false);
            }
        } catch (err: any) {
            setDeleteError(err.message || t('deleting'));
            setIsDeleting(false);
            setIsConfirmingDelete(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsChangingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(false);

        const formData = new FormData(e.currentTarget);
        try {
            const res = await changePassword(formData);
            if (res.success) {
                setPasswordSuccess(true);
                e.currentTarget.reset();
            } else {
                setPasswordError(res.error || '');
            }
        } catch {
            setPasswordError('');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-gray-900 placeholder-gray-400 bg-white transition-all mb-4";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
                <p className="text-gray-400 text-sm">{t('subtitle')}</p>
            </div>

            {/* Password Change Section */}
            <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Key className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-gray-800">{t('changePassword')}</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="max-w-md">
                    <div>
                        <label className={labelClasses}>{t('currentPassword')}</label>
                        <input
                            type="password"
                            name="currentPassword"
                            className={inputClasses}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>{t('newPassword')}</label>
                        <input
                            type="password"
                            name="newPassword"
                            className={inputClasses}
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>{t('confirmPassword')}</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={inputClasses}
                            required
                        />
                    </div>

                    {passwordError && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded text-red-700 text-sm flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4" />
                            {passwordError}
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="p-3 bg-green-50 border border-green-100 rounded text-green-700 text-sm flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-4 h-4" />
                            {t('passwordChanged')}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isChangingPassword}
                        variant="primary"
                        className="w-full md:w-auto"
                    >
                        {isChangingPassword ? t('updating') : t('updatePassword')}
                    </Button>
                </form>
            </Card>

            {/* Danger Zone Section */}
            <Card className="p-6 space-y-6 border-red-100 bg-red-50/30">
                <div className="flex items-center gap-3 pb-4 border-b border-red-100">
                    <div className="bg-red-100 p-2 rounded-lg">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="font-semibold text-red-800">{t('dangerZone')}</h2>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <p className="font-bold text-gray-900">{t('deleteAccount')}</p>
                        <p className="text-sm text-gray-600 max-w-xl">
                            {t('deleteDescription')}
                            <span className="font-semibold"> {t('deleteNote')}</span>
                        </p>
                    </div>

                    {!isConfirmingDelete ? (
                        <Button
                            variant="primary"
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                            onClick={() => setIsConfirmingDelete(true)}
                        >
                            {t('deleteButton')}
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsConfirmingDelete(false)}
                                disabled={isDeleting}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-red-700 hover:bg-red-800 border-none"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? t('deleting') : t('deleteConfirm')}
                            </Button>
                        </div>
                    )}
                </div>

                {deleteError && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {deleteError}
                    </div>
                )}
            </Card>
        </div>
    );
}
