import { getSystemSettings } from '../actions';
import ShopNavigation from '@/components/ShopNavigation';
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
        <main className="min-h-screen bg-white">
            <ShopNavigation />

            {/* Hero / Header Section */}
            <div className="bg-gray-50 py-20 border-b">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Kontakt</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                        Jesteśmy do Twojej dyspozycji. Zapraszamy do kontaktu telefonicznego, mailowego lub osobistego w naszej siedzibie.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="space-y-20">

                    {/* TOP SECTION: Contact Details & Map side-by-side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                        {/* LEFT: Contact Info */}
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <section>
                                    <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Adres</h2>
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
                                    <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Kontakt</h2>
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
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t pt-8">
                                <section>
                                    <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Godziny Otwarcia</h2>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 flex-shrink-0">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 truncate">Poniedziałek - Piątek</p>
                                            <p className="text-gray-600">08:00 - 16:00</p>
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
                                        <p className="font-bold">Skonfiguruj mapę w panelu admina</p>
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: Booking */}
                    <div id="rezerwacja" className="max-w-5xl mx-auto">
                        <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-red-50 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
                            <div className="bg-gradient-to-r from-red-600 to-red-700 p-10 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                <h2 className="text-4xl font-black mb-3 uppercase italic tracking-tighter relative z-10">Zarezerwuj Warsztaty</h2>
                                <p className="text-red-100 font-medium text-lg relative z-10">Wybierz dogodny termin i stwórz coś wyjątkowego w naszej hucie</p>
                            </div>
                            <div className="p-8 lg:p-12">
                                <BookingCalendar />
                            </div>
                            <div className="bg-gray-50 p-6 border-t text-center">
                                <p className="text-sm text-gray-500 font-medium">
                                    Potrzebujesz terminu dla grupy zorganizowanej? <a href={`tel:${contactInfo.phones[0]}`} className="text-red-600 font-bold hover:underline">Zadzwoń do nas!</a>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
