import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from "@/components/Providers";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Toaster } from 'sonner';

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Bolglass - Fabryka Magii",
    description: "Ręcznie dmuchane bombki choinkowe",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSystemSettings } from "@/app/[locale]/actions";
import MainLayoutSpacer from "@/components/MainLayoutSpacer";

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!['en', 'de', 'pl'].includes(locale)) {
        notFound();
    }

    let messages;
    let settings: Record<string, string> = {};
    try {
        [messages, settings] = await Promise.all([
            getMessages(),
            getSystemSettings()
        ]);
    } catch {
        messages = {};
    }

    return (
        <html lang={locale}>
            <body className={`${inter.variable} antialiased font-sans bg-black text-white`}>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <Providers>
                        <AnalyticsTracker />
                        <Navbar logoUrl={settings.contact_logo} />
                        <MainLayoutSpacer />
                        {children}
                        <Footer />
                        <Toaster position="top-right" richColors />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
