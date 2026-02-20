import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { getSystemSettings } from '@/app/[locale]/actions';

export default async function Footer() {
    const t = await getTranslations('Common');
    const settings = await getSystemSettings();

    const contactInfo = {
        address: settings.company_address || 'ul. Witkowska 78',
        city: settings.company_city || '62-200 Gniezno',
        phone: settings.phone_1 || '+48 123 456 789',
        email: settings.email || 'biuro@bolglass.pl',
        fb: settings.facebook_url,
        ig: settings.instagram_url,
        yt: settings.youtube_url,
        logo: settings.contact_logo
    };

    return (
        <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            <div className="w-40 h-16 relative">
                                <Image
                                    src={contactInfo.logo || "/bolglass-logo-white.png"}
                                    alt="Bolglass Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-amber-200/40 text-sm leading-relaxed font-light italic">
                            {t('footer.tagline')}
                        </p>
                        <div className="flex gap-4">
                            {contactInfo.ig && (
                                <a href={contactInfo.ig} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 border border-white/5 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/30 transition-all" title="Instagram">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {contactInfo.fb && (
                                <a href={contactInfo.fb} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 border border-white/5 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/30 transition-all" title="Facebook">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            )}
                            {contactInfo.yt && (
                                <a href={contactInfo.yt} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 border border-white/5 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/30 transition-all" title="Youtube">
                                    <Youtube className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">{t('nav.about')}</h4>
                        <ul className="space-y-4 text-amber-200/40 text-sm font-light">
                            <li><Link href="/o-nas" className="hover:text-amber-500 transition-colors">{t('nav.about')}</Link></li>
                            <li><Link href="/galeria" className="hover:text-amber-500 transition-colors">{t('nav.gallery')}</Link></li>
                            <li><Link href="/sklep" className="hover:text-amber-500 transition-colors">{t('nav.shop')}</Link></li>
                            <li><Link href="/#booking" className="hover:text-amber-500 transition-colors">{t('nav.workshops')}</Link></li>
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div className="space-y-6">
                        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">{t('footer.account')}</h4>
                        <ul className="space-y-4 text-amber-200/40 text-sm font-light">
                            <li><Link href="/moje-konto" className="hover:text-amber-500 transition-colors">{t('footer.myOrders')}</Link></li>
                            <li><Link href="/koszyk" className="hover:text-amber-500 transition-colors">{t('footer.myCart')}</Link></li>
                            <li><Link href="/kontakt" className="hover:text-amber-500 transition-colors">{t('nav.contact')}</Link></li>
                            <li><Link href="#" className="hover:text-amber-500 transition-colors">{t('footer.terms')}</Link></li>
                            <li><Link href="#" className="hover:text-amber-500 transition-colors">{t('footer.privacy')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">{t('nav.contact')}</h4>
                        <ul className="space-y-4 text-amber-200/40 text-sm font-light">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>{contactInfo.address}<br />{contactInfo.city}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                                <a href={`tel:${contactInfo.phone}`} className="hover:text-amber-500 transition-colors">{contactInfo.phone}</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                                <a href={`mailto:${contactInfo.email}`} className="hover:text-amber-500 transition-colors">{contactInfo.email}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] text-amber-500/20 font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} Bolglass Sp. z o.o. {t('footer.copyright')}
                    </p>
                    <div className="flex items-center gap-4 grayscale opacity-30">
                        <Image src="/payments/payu.svg" alt="PayU" width={40} height={20} className="object-contain" />
                        <Image src="/payments/visa.svg" alt="Visa" width={40} height={20} className="object-contain" />
                        <Image src="/payments/mastercard.svg" alt="Mastercard" width={40} height={20} className="object-contain" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
