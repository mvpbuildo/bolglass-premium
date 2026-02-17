import { getSystemSettings } from '../actions';
import BookingCalendar from '@/components/BookingCalendar';
import { Facebook, Instagram, Mail, Phone, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';

export default async function ContactPage() {
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
        <main className="min-h-screen bg-[#050505] pt-20">
            {/* Hero / Header Section */}
            <div className="relative py-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <span className="text-amber-500 text-xs font-black uppercase tracking-[0.5em] block mb-4">
                        Manufaktura Bolglass
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-50 via-amber-200 to-amber-500 drop-shadow-[0_10px_30px_rgba(245,158,11,0.3)] mb-8">
                        Kontakt
                    </h1>
                    <p className="text-xl text-amber-200/40 max-w-2xl mx-auto font-light italic leading-relaxed">
                        Jesteśmy do Twojej dyspozycji. Zapraszamy do kontaktu telefonicznego, mailowego lub osobistego w naszej siedzibie.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                <div className="space-y-32">
                    {/* TOP SECTION: Contact Details & Map side-by-side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-stretch">
                        {/* LEFT: Contact Info */}
                        <div className="space-y-16">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                                <section className="space-y-6">
                                    <h2 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Lokalizacja</h2>
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                            <MapPin size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-serif text-xl text-amber-50 leading-tight">{contactInfo.name}</p>
                                            <p className="text-amber-200/40 font-light italic">{contactInfo.address}</p>
                                            <p className="text-amber-200/40 font-light italic">{contactInfo.city}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h2 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Kontakt</h2>
                                    <div className="space-y-6">
                                        {contactInfo.phones.map((phone, idx) => (
                                            <div key={idx} className="flex gap-4 items-center group">
                                                <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                                    <Phone size={20} />
                                                </div>
                                                <a href={`tel:${phone}`} className="font-bold text-amber-50 hover:text-amber-500 transition-colors tracking-tight text-lg">
                                                    {phone}
                                                </a>
                                            </div>
                                        ))}
                                        {/* ... email ... */}
                                        <div className="flex gap-4 items-center group">
                                            <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                                <Mail size={20} />
                                            </div>
                                            <a href={`mailto:${contactInfo.email}`} className="font-bold text-amber-50 hover:text-amber-500 transition-colors tracking-tight text-lg">
                                                {contactInfo.email}
                                            </a>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                                <section className="space-y-6">
                                    <h2 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Godziny Otwarcia</h2>
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
                                            <Clock size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-serif text-xl text-amber-50 leading-tight">Poniedziałek - Piątek</p>
                                            <p className="text-amber-200/40 font-light italic">08:00 - 16:00</p>
                                        </div>
                                    </div>
                                </section>

                                {(contactInfo.fb || contactInfo.ig) && (
                                    <section className="space-y-6">
                                        <h2 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Social Media</h2>
                                        <div className="flex gap-4">
                                            {contactInfo.fb && (
                                                <a href={contactInfo.fb} target="_blank" rel="noopener noreferrer" title="Facebook Bolglass" className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                                                    <Facebook size={24} />
                                                </a>
                                            )}
                                            {contactInfo.ig && (
                                                <a href={contactInfo.ig} target="_blank" rel="noopener noreferrer" title="Instagram Bolglass" className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                                                    <Instagram size={24} />
                                                </a>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {contactInfo.logo && (
                                <div className="hidden lg:flex justify-start pt-12 opacity-30 hover:opacity-100 transition-all">
                                    <Image src={contactInfo.logo} alt="Logo" width={180} height={80} className="object-contain" />
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Map */}
                        <div className="h-full min-h-[500px]">
                            <div className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl group h-full shadow-2xl">
                                {contactInfo.map ? (
                                    <div
                                        className="w-full h-full border-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                                        dangerouslySetInnerHTML={{
                                            __html: contactInfo.map.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"')
                                        }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-amber-500/20">
                                        <MapPin size={48} className="mb-4" />
                                        <p className="font-serif text-lg italic">Skonfiguruj mapę w panelu admina</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-[2rem]"></div>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: Booking */}
                    <div id="rezerwacja" className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-500/0 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-white/5 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-12 text-center border-b border-white/5">
                                <h2 className="text-4xl md:text-5xl font-serif text-amber-50 mb-4">Zarezerwuj Warsztaty</h2>
                                <p className="text-amber-200/40 text-lg font-light italic">Wybierz dogodny termin i stwórz coś wyjątkowego w naszej manufakturze</p>
                            </div>
                            <div className="p-8 lg:p-16">
                                <BookingCalendar />
                            </div>
                            <div className="bg-black/20 p-8 border-t border-white/5 text-center">
                                <p className="text-sm text-amber-200/40 font-light italic">
                                    Potrzebujesz terminu dla grupy zorganizowanej? <a href={`tel:${contactInfo.phones[0]}`} className="text-amber-500 font-black hover:text-amber-400 transition-colors uppercase tracking-widest text-xs ml-2">Zadzwoń do nas</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
