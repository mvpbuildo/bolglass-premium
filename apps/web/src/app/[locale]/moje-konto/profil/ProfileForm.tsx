'use client';

import { useState } from 'react';
import { Button } from '@bolglass/ui';
import { updateProfile } from './actions';
import { Building2, User, Home, Truck, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ProfileForm({ user }: { user: any }) {
    const t = useTranslations('Account.profile');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompany, setIsCompany] = useState(user.isCompany);

    async function action(formData: FormData) {
        setIsSubmitting(true);
        try {
            await updateProfile(formData);
            alert(t('savedSuccess'));
        } catch (err: any) {
            alert(t('saveError') + ': ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-gray-950 placeholder-gray-400 bg-white transition-all";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";
    const sectionTitleClasses = "flex items-center gap-2 text-gray-900 font-bold border-b pb-2 mb-4";

    return (
        <form action={action} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* --- LEFT COLUMN: PERSONAL --- */}
                <div className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className={sectionTitleClasses}>
                            <User className="w-5 h-5 text-red-600" />
                            <h2>{t('basicInfo')}</h2>
                        </div>
                        <div>
                            <label className={labelClasses}>{t('nameLabel')}</label>
                            <input
                                name="name"
                                defaultValue={user.name || ''}
                                className={inputClasses}
                                placeholder="Jan Kowalski"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-1.5 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> {t('emailLabel')}
                            </label>
                            <input
                                value={user.email || ''}
                                disabled
                                className="w-full px-4 py-2 border bg-gray-50 rounded-xl text-gray-500 font-medium outline-none cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>{t('phoneLabel')}</label>
                            <input
                                name="personalPhone"
                                defaultValue={user.personalPhone || user.phone || ''}
                                className={inputClasses}
                                placeholder="+48 000 000 000"
                            />
                        </div>
                    </div>

                    {/* Resident Address */}
                    <div className="space-y-4">
                        <div className={sectionTitleClasses}>
                            <Home className="w-5 h-5 text-red-600" />
                            <h2>{t('homeAddress')}</h2>
                        </div>
                        <div>
                            <label className={labelClasses}>{t('streetLabel')}</label>
                            <input
                                name="personalStreet"
                                defaultValue={user.personalStreet || user.street || ''}
                                className={inputClasses}
                                placeholder="ul. Sezamkowa 1/2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>{t('zipLabel')}</label>
                                <input
                                    name="personalZipCode"
                                    defaultValue={user.personalZipCode || user.zipCode || ''}
                                    className={inputClasses}
                                    placeholder="00-000"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>{t('cityLabel')}</label>
                                <input
                                    name="personalCity"
                                    defaultValue={user.personalCity || user.city || ''}
                                    className={inputClasses}
                                    placeholder="Warszawa"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: SHIPPING & COMPANY --- */}
                <div className="space-y-8">

                    {/* Shipping Address */}
                    <div className="space-y-4">
                        <div className={sectionTitleClasses}>
                            <Truck className="w-5 h-5 text-red-600" />
                            <h2>{t('shippingAddress')}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>{t('shippingFirstName')}</label>
                                <input
                                    name="shippingFirstName"
                                    defaultValue={user.shippingFirstName || ''}
                                    className={inputClasses}
                                    placeholder="Jan"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>{t('shippingLastName')}</label>
                                <input
                                    name="shippingLastName"
                                    defaultValue={user.shippingLastName || ''}
                                    className={inputClasses}
                                    placeholder="Kowalski"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>{t('shippingPhone')}</label>
                            <input
                                name="shippingPhone"
                                defaultValue={user.shippingPhone || ''}
                                className={inputClasses}
                                placeholder="+48 000 000 000"
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>{t('shippingStreet')}</label>
                            <input
                                name="shippingStreet"
                                defaultValue={user.shippingStreet || ''}
                                className={inputClasses}
                                placeholder="ul. Dostawcza 5"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>{t('zipLabel')}</label>
                                <input
                                    name="shippingZipCode"
                                    defaultValue={user.shippingZipCode || ''}
                                    className={inputClasses}
                                    placeholder="00-000"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>{t('cityLabel')}</label>
                                <input
                                    name="shippingCity"
                                    defaultValue={user.shippingCity || ''}
                                    className={inputClasses}
                                    placeholder="Warszawa"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Company Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 mb-4">
                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                <Building2 className="w-5 h-5 text-red-600" />
                                <h2>{t('companyData')}</h2>
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
                                    <label className={labelClasses}>{t('nipLabel')}</label>
                                    <input
                                        name="nip"
                                        defaultValue={user.nip || ''}
                                        placeholder="PL0000000000"
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>{t('companyNameLabel')}</label>
                                    <input
                                        name="companyName"
                                        defaultValue={user.companyName || ''}
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClasses}>{t('companyAddressLabel')}</label>
                                    <input
                                        name="companyStreet"
                                        defaultValue={user.companyStreet || ''}
                                        placeholder={t('streetPlaceholder')}
                                        className={inputClasses}
                                    />
                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                        <input
                                            name="companyZip"
                                            defaultValue={user.companyZip || ''}
                                            placeholder="00-000"
                                            className={inputClasses}
                                        />
                                        <input
                                            name="companyCity"
                                            defaultValue={user.companyCity || ''}
                                            placeholder="Warszawa"
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 border border-dashed rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-sm text-center">
                                {t('companyToggleHint').split('\n').map((line, i) => (
                                    <span key={i}>{line}{i === 0 && <br />}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t flex justify-end">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="px-12 py-3 text-lg"
                >
                    {isSubmitting ? t('saving') : t('saveButton')}
                </Button>
            </div>
        </form>
    );
}
