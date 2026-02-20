import { getSystemSettings } from '@/app/[locale]/actions';
import { Facebook, Instagram, Mail, Phone, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function ContactSection() {
    const t = await getTranslations('Contact');
    const settings = await getSystemSettings();

    const contactInfo = {
        name: settings.company_name || 'BOLGLASS',
        address: settings.company_address || 'ul. Witkowska 78',
        city: settings.company_city || '62-200 Gniezno',
        phones: [settings.phone_1, settings.phone_2].filter(Boolean) as string[],
        email: settings.email || 'biuro@bolglass.pl',
        fb: settings.facebook_url,
        ig: settings.instagram_url,
        logo: settings.logo_url,
        map: settings.google_maps_iframe
    };

    return (
        <section id="contact" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">{t('title')}</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-amber-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    {/* LEFT: Contact Info */}
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">{t('address')}</h2>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 flex-shrink-0">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 leading-tight">{contactInfo.name}</p>
                                            <p className="text-gray-600">{contactInfo.address}</p>
                                            <p className="text-gray-600">{contactInfo.city}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">{t('hours')}</h2>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 flex-shrink-0">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 truncate">{t('weekdays')}</p>
                                            <p className="text-gray-600">08:00 - 16:00</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">{t('contact')}</h2>
                                    <div className="space-y-4">
                                        {contactInfo.phones.map((phone, idx) => (
                                            <div key={idx} className="flex gap-4 items-center">
                                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                                    <Phone size={20} />
                                                </div>
                                                <a href={`tel:${phone}`} className="font-bold text-gray-900 hover:text-red-600 transition-colors">
                                                    {phone}
                                                </a>
                                            </div>
                                        ))}
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                <Mail size={20} />
                                            </div>
                                            <a href={`mailto:${contactInfo.email}`} className="font-bold text-gray-900 hover:text-red-600 transition-colors">
                                                {contactInfo.email}
                                            </a>
                                        </div>
                                    </div>
                                </section>

                                {(contactInfo.fb || contactInfo.ig) && (
                                    <section>
                                        <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Social Media</h2>
                                        <div className="flex gap-4">
                                            {contactInfo.fb && (
                                                <a href={contactInfo.fb} target="_blank" rel="noopener noreferrer" title="Facebook Bolglass" className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                                    <Facebook size={24} />
                                                </a>
                                            )}
                                            {contactInfo.ig && (
                                                <a href={contactInfo.ig} target="_blank" rel="noopener noreferrer" title="Instagram Bolglass" className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-600 hover:text-white transition-all transform hover:-translate-y-1">
                                                    <Instagram size={24} />
                                                </a>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>

                        {contactInfo.logo && (
                            <div className="hidden lg:flex justify-start pt-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                                <Image src={contactInfo.logo} alt="Logo" width={180} height={80} className="object-contain" />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Map */}
                    <div className="h-full min-h-[400px]">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-100 aspect-video lg:aspect-square group h-full">
                            {contactInfo.map ? (
                                <div
                                    className="w-full h-full border-0"
                                    dangerouslySetInnerHTML={{
                                        __html: contactInfo.map.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"')
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-200">
                                    <MapPin size={48} className="mb-4 animate-bounce" />
                                    <p className="font-bold">{t('mapPlaceholder')}</p>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
