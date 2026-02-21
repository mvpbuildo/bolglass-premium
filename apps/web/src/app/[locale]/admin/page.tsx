import { Link } from '@/i18n/navigation';
import { Card } from '@bolglass/ui';
import {
    Calendar,
    ShoppingBag,
    Settings,
    ChevronRight,
    Package,
    Users,
    ShoppingCart,
    Clock,
    Tag,
    Image as ImageIcon,
    Files,
    ArrowRight,
    Phone,
    TrendingUp,
    Bot
} from 'lucide-react';
import { prisma } from '@bolglass/database';
import { format } from 'date-fns';

async function getRecentOrders() {
    return await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            items: true
        }
    });
}

function getStatusStyles(status: string) {
    switch (status) {
        case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
        case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
        default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
}

export default async function AdminDashboardPage() {
    const orders = await getRecentOrders();

    const modules = [
        {
            title: 'WARSZTATY',
            description: 'Zarządzaj rezerwacjami i kalendarzem warsztatów.',
            icon: <Calendar className="w-8 h-8 text-blue-600" />,
            color: 'border-blue-100 bg-blue-50/30',
            bg: 'bg-blue-600',
            links: [
                { name: 'Rezerwacje', path: '/admin/bookings', icon: <Clock className="w-4 h-4" /> },
                { name: 'Ustawienia', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
            ]
        },
        {
            title: 'SKLEP',
            description: 'Zarządzaj asortymentem produktów i zamówieniami.',
            icon: <ShoppingBag className="w-8 h-8 text-green-600" />,
            color: 'border-green-100 bg-green-50/30',
            bg: 'bg-green-600',
            links: [
                { name: 'Produkty', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
                { name: 'Zamówienia', path: '/admin/orders', icon: <ShoppingCart className="w-4 h-4" /> },
                { name: 'Konfigurator 3D', path: '/admin/settings/3d', icon: <Settings className="w-4 h-4" /> },
                { name: 'Ustawienia', path: '/admin/settings/shop', icon: <Settings className="w-4 h-4" /> },
            ]
        },
        {
            title: 'MARKETING',
            description: 'Zarządzaj promocjami i komunikacją z klientami.',
            icon: <Tag className="w-8 h-8 text-purple-600" />,
            color: 'border-purple-100 bg-purple-50/30',
            bg: 'bg-purple-600',
            links: [
                { name: 'Kody Rabatowe', path: '/admin/marketing/rabaty', icon: <Tag className="w-4 h-4" /> },
                { name: 'Mailing', path: '/admin/marketing/mailing', icon: <ShoppingCart className="w-4 h-4" /> },
                { name: 'Analityka', path: '/admin/marketing/analityka', icon: <TrendingUp className="w-4 h-4" /> },
            ]
        },
        {
            title: 'GALERIA',
            description: 'Zarządzaj multimediami i galerią realizacji.',
            icon: <ImageIcon className="w-8 h-8 text-orange-600" />,
            color: 'border-orange-100 bg-orange-50/30',
            bg: 'bg-orange-600',
            links: [
                { name: 'Zdjęcia', path: '/admin/gallery', icon: <ImageIcon className="w-4 h-4" /> },
                { name: 'Realizacje', path: '/admin/gallery/realizacje', icon: <ShoppingCart className="w-4 h-4" /> },
            ]
        },
        {
            title: 'SYSTEM',
            description: 'Zarządzaj użytkownikami i uprawnieniami.',
            icon: <Settings className="w-8 h-8 text-gray-600" />,
            color: 'border-gray-100 bg-gray-50/30',
            bg: 'bg-gray-900',
            links: [
                { name: 'Użytkownicy', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
                { name: 'Sztuczna Inteligencja', path: '/admin/system/settings', icon: <Bot className="w-4 h-4" /> },
                { name: 'Ustawienia', path: '/admin/system/settings', icon: <Settings className="w-4 h-4" /> },
            ]
        },
        {
            title: 'KONTAKT',
            description: 'Edytuj dane firmy, mapę i social media.',
            icon: <Phone className="w-8 h-8 text-pink-600" />,
            color: 'border-pink-100 bg-pink-50/30',
            bg: 'bg-pink-600',
            links: [
                { name: 'Konfiguracja', path: '/admin/system/settings', icon: <Settings className="w-4 h-4" /> },
            ]
        },
        {
            title: 'ZASOBY',
            description: 'Zarządzaj plikami i obrazami na serwerze.',
            icon: <Files className="w-8 h-8 text-cyan-600" />,
            color: 'border-cyan-100 bg-cyan-50/30',
            bg: 'bg-cyan-600',
            links: [
                { name: 'Pliki', path: '/admin/files', icon: <Files className="w-4 h-4" /> },
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Witaj w Panelu Admina</h1>
                    <p className="text-gray-500 mt-2">Wybierz moduł, którym chcesz dzisiaj zarządzać.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {modules.map((module) => (
                        <Card key={module.title} className={`p-0 overflow-hidden border-2 flex flex-col h-full hover:shadow-xl transition-all duration-300 ${module.color}`}>
                            <div className="p-8 flex-grow">
                                <div className="mb-6">{module.icon}</div>
                                <h2 className="text-xl font-black text-gray-900 mb-2 tracking-wide font-mono uppercase">{module.title}</h2>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">{module.description}</p>
                            </div>

                            <div className="p-4 bg-white/60 border-t border-inherit flex flex-col gap-2">
                                {module.links.map((link) => (
                                    <Link key={link.path} href={link.path}>
                                        <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="p-1.5 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                                    {link.icon}
                                                </span>
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{link.name}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Recent Orders Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ostatnie Zamówienia</h2>
                            <p className="text-gray-500 text-sm mt-1">Szybki podgląd najnowszej aktywności w sklepie.</p>
                        </div>
                        <Link href="/admin/orders" className="inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-4 py-2 text-sm gap-2">
                            Wszystkie Zamówienia <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {orders.length === 0 ? (
                            <Card className="p-8 text-center border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">Brak niedawnych zamówień.</p>
                            </Card>
                        ) : (
                            orders.map((order) => (
                                <Card key={order.id} className="p-4 hover:shadow-md transition-shadow group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                                <ShoppingCart className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-gray-400">#{order.id.substring(0, 8)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">{order.email}</h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Data</p>
                                                <p className="font-bold text-sm">{format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Suma</p>
                                                <p className="text-lg font-black text-gray-900">{order.total.toFixed(2)} PLN</p>
                                            </div>
                                            <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm h-auto p-2 group">
                                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-all group-hover:translate-x-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-16 text-center text-xs text-gray-400 font-medium">
                    Bolglass Admin Portal &bull; Build 2026.02.16 &bull; System Status: <span className="text-green-500 font-bold uppercase tracking-widest">Online</span>
                </div>
            </div>
        </main>
    );
}
