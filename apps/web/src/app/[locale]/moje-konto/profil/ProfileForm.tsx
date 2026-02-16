'use client'

import { useState } from 'react';
import { Button } from '@bolglass/ui';
import { updateProfile } from './actions';
import { Building2, User } from 'lucide-react';

export default function ProfileForm({ user }: { user: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompany, setIsCompany] = useState(user.isCompany);

    async function action(formData: FormData) {
        setIsSubmitting(true);
        try {
            await updateProfile(formData);
            alert("Profil zaktualizowany!");
        } catch (e) {
            alert("Błąd aktualizacji.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form action={action} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-900 font-bold border-b pb-2">
                        <User className="w-5 h-5" />
                        <h2>Dane Osobowe</h2>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imię i Nazwisko</label>
                        <input
                            name="name"
                            defaultValue={user.name || ''}
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email (nieedytowalny)</label>
                        <input
                            value={user.email || ''}
                            disabled
                            className="w-full px-4 py-2 border bg-gray-50 rounded-xl text-gray-400 outline-none"
                        />
                    </div>
                </div>

                {/* Company Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                            <Building2 className="w-5 h-5" />
                            <h2>Dane Firmowe</h2>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isCompany"
                                className="sr-only peer"
                                checked={isCompany}
                                onChange={(e) => setIsCompany(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    {isCompany ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                                <input
                                    name="nip"
                                    defaultValue={user.nip || ''}
                                    placeholder="PL0000000000"
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa Firmy</label>
                                <input
                                    name="companyName"
                                    defaultValue={user.companyName || ''}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Adres Firmy</label>
                                <input
                                    name="companyStreet"
                                    defaultValue={user.companyStreet || ''}
                                    placeholder="Ulica i numer"
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none mb-2"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        name="companyZip"
                                        defaultValue={user.companyZip || ''}
                                        placeholder="00-000"
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                    <input
                                        name="companyCity"
                                        defaultValue={user.companyCity || ''}
                                        placeholder="Miasto"
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-sm text-center">
                            Włącz przełącznik powyżej,<br />jeśli chcesz dodać dane firmowe.
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-8 border-t flex justify-end">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="px-12 py-3 text-lg"
                >
                    {isSubmitting ? "Zapisywanie..." : "Zapisz Zmiany"}
                </Button>
            </div>
        </form>
    );
}
