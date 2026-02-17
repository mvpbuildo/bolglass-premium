'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
    const t = useTranslations('Common.nav');

    return (
        <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <div className="w-16 h-16 bg-white rounded-full p-2 ring-2 ring-white/5 shadow-2xl">
                                <Image
                                    src="/bolglass-logo-blue.png"
                                    alt="Bolglass Logo"
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-amber-200/40 text-sm leading-relaxed font-light italic">
                            Od 78 lat tworzymy magię szklanych ozdób choinkowych, łącząc tradycyjne rzemiosło z nowoczesnym designem.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-full bg-white/5 border border-white/5 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/30 transition-all" title="Instagram">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-white/5 border border-white/5 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/30 transition-all" title="Facebook">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-white/5 border border-white/5 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/30 transition-all" title="Youtube">
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Nawigacja</h4>
                        <ul className="space-y-4 text-amber-200/40 text-sm font-light">
                            <li><Link href="/#about" className="hover:text-amber-500 transition-colors">O Nas</Link></li>
                            <li><Link href="/galeria" className="hover:text-amber-500 transition-colors">Galeria</Link></li>
                            <li><Link href="/sklep" className="hover:text-amber-500 transition-colors">Sklep</Link></li>
                            <li><Link href="/#booking" className="hover:text-amber-500 transition-colors">Warsztaty</Link></li>
                            <li><Link href="/#b2b" className="hover:text-amber-500 transition-colors">Dla Firm</Link></li>
                        </ul>
                    </div>

                    {/* Shop Info */}
                    <div className="space-y-6">
                        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Twoje Konto</h4>
                        <ul className="space-y-4 text-amber-200/40 text-sm font-light">
                            <li><Link href="/moje-konto" className="hover:text-amber-500 transition-colors">Moje Zamówienia</Link></li>
                            <li><Link href="/koszyk" className="hover:text-amber-500 transition-colors">Mój Koszyk</Link></li>
                            <li><Link href="/kontakt" className="hover:text-amber-500 transition-colors">Pomoc</Link></li>
                            <li><Link href="#" className="hover:text-amber-500 transition-colors">Regulamin</Link></li>
                            <li><Link href="#" className="hover:text-amber-500 transition-colors">Polityka Prywatności</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Kontakt</h4>
                        <ul className="space-y-4 text-amber-200/40 text-sm font-light">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>ul. Warszawska 12<br />Nowy Sącz, Polska</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>+48 123 456 789</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>biuro@bolglass.pl</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] text-amber-500/20 font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} Bolglass Sp. z o.o. Wszystkie prawa zastrzeżone.
                    </p>
                    <div className="flex items-center gap-4 grayscale opacity-30">
                        <Image src="/payments/payu.png" alt="PayU" width={40} height={20} className="object-contain" />
                        <Image src="/payments/visa.png" alt="Visa" width={40} height={20} className="object-contain" />
                        <Image src="/payments/mastercard.png" alt="Mastercard" width={40} height={20} className="object-contain" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
