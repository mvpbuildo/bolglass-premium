import { prisma } from '@bolglass/database';
import { Card } from '@bolglass/ui';
import { addTelegramSubscriber, deleteTelegramSubscriber } from './actions';
import TokenForm from './TokenForm';
import { Bell, UserPlus, Trash2, MessagesSquare, CheckCircle, XCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function TelegramSettingsPage() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') redirect('/api/auth/signin');

    const subscribers = await prisma.telegramSubscriber.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const botTokenSetting = await prisma.systemSetting.findUnique({
        where: { key: 'telegram_bot_token' }
    });

    const botToken = botTokenSetting?.value || '';

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                        <MessagesSquare className="w-8 h-8 text-blue-500" />
                        Powiadomienia Telegram
                    </h1>
                    <p className="text-gray-500">Zarządzaj zespołem i decyduj kto otrzymuje asynchroniczne powiadomienia na telefon.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ustawienia Globalne - API Token */}
                <div className="lg:col-span-3">
                    <Card className="p-6 border-blue-100 bg-blue-50/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                <MessagesSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Klucz Autoryzacji (Bot Token)</h2>
                                <p className="text-sm text-gray-500">Skopiuj i wklej wygenerowany klucz od BotFather.</p>
                            </div>
                        </div>

                        <TokenForm defaultValue={botToken} />
                    </Card>
                </div>

                {/* Formularz dodawania */}
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold">Dodaj Odbiorcę</h2>
                        </div>

                        <form action={addTelegramSubscriber} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Telegram Chat ID</label>
                                <input type="text" name="chatId" required placeholder="np. 987654321" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                <p className="text-xs text-gray-500 mt-1">ID uzyskasz pisząc do bota: np. @userinfobot</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Imię i Nazwisko / Nazwa</label>
                                <input type="text" name="name" required placeholder="Jan Kowalski" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Stanowisko (Opcjonalnie)</label>
                                <input type="text" name="roleDescription" placeholder="np. Pakowanie Paczek, Zmiana B" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Uprawnienia Powiadomień</h3>

                                <label className="flex items-center gap-3 mb-2 cursor-pointer">
                                    <input type="checkbox" name="receivesOrders" value="true" defaultChecked className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700">Sklep (Zaksięgowane Zamówienia)</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="receivesBookings" value="true" defaultChecked className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700">Kalendarz (Nowe Rezerwacje)</span>
                                </label>
                            </div>

                            <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <Bell className="w-4 h-4" /> Autoryzuj Pracownika
                            </button>
                        </form>
                    </Card>
                </div>

                {/* Lista */}
                <div className="lg:col-span-2">
                    <Card className="p-0 overflow-hidden border-2 border-gray-100">
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Aktywni Pracownicy ({subscribers.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {subscribers.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    Nikt jeszcze nie subskrybuje asystenta.
                                </div>
                            ) : (
                                subscribers.map(sub => (
                                    <div key={sub.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                                                {sub.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{sub.name}</h3>
                                                <p className="text-sm text-gray-500">ID: <code className="bg-gray-100 px-1 rounded">{sub.chatId}</code> {sub.roleDescription ? `• ${sub.roleDescription}` : ''}</p>

                                                <div className="flex gap-4 mt-2">
                                                    <span className={`text-xs font-bold flex items-center gap-1 ${sub.receivesOrders ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {sub.receivesOrders ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        Sklep
                                                    </span>
                                                    <span className={`text-xs font-bold flex items-center gap-1 ${sub.receivesBookings ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {sub.receivesBookings ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        Warsztaty
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <form action={async () => {
                                            'use server';
                                            await deleteTelegramSubscriber(sub.id);
                                        }}>
                                            <button type="submit" className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Usuń z listy powiadomień">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
