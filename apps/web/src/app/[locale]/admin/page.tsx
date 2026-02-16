import AdminNavigation from '@/components/AdminNavigation';
import { Link } from '@/i18n/navigation';
import { Card } from '@bolglass/ui';
import { Calendar, ShoppingBag, Settings, ChevronRight, Package, Users, ShoppingCart, Clock, Tag, Image } from 'lucide-react';

export default function AdminDashboardPage() {
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
            description: 'Zarządzaj asortymentem produktów i zamówieniami klientów.',
            icon: <ShoppingBag className="w-8 h-8 text-green-600" />,
            color: 'border-green-100 bg-green-50/30',
            bg: 'bg-green-600',
            links: [
                { name: 'Produkty', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
                { name: 'Zamówienia', path: '/admin/orders', icon: <ShoppingCart className="w-4 h-4" /> },
            ]
        },
        {
            title: 'MARKETING',
            description: 'Zarządzaj promocjami i komunikacją z klientami.',
            icon: <Tag className="w-8 h-8 text-purple-600" />,
            color: 'border-purple-100 bg-purple-50/30',
            bg: 'bg-purple-600',
            links: [
                { name: 'Promocje', path: '/admin/marketing/promocje', icon: <Tag className="w-4 h-4" /> },
                { name: 'Newsletter', path: '/admin/marketing/newsletter', icon: <ShoppingCart className="w-4 h-4" /> },
            ]
        },
        {
            title: 'GALERIA',
            description: 'Zarządzaj multimediami i galerią realizacji.',
            icon: <Image className="w-8 h-8 text-orange-600" />,
            color: 'border-orange-100 bg-orange-50/30',
            bg: 'bg-orange-600',
            links: [
                { name: 'Zdjęcia', path: '/admin/gallery', icon: <Image className="w-4 h-4" /> },
                { name: 'Realizacje', path: '/admin/gallery/realizacje', icon: <ShoppingCart className="w-4 h-4" /> },
            ]
        },
        {
            title: 'SYSTEM',
            description: 'Zarządzaj użytkownikami i uprawnieniami systemowymi.',
            icon: <Settings className="w-8 h-8 text-gray-600" />,
            color: 'border-gray-100 bg-gray-50/30',
            bg: 'bg-gray-900',
            links: [
                { name: 'Użytkownicy', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <AdminNavigation />

                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Witaj w Panelu Admina</h1>
                    <p className="text-gray-500 mt-2">Wybierz moduł, którym chcesz dzisiaj zarządzać.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                                <span className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
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

                <div className="mt-16 text-center text-xs text-gray-400 font-medium">
                    Bolglass Admin Portal &bull; Build 2026.02.16 &bull; System Status: <span className="text-green-500 font-bold uppercase tracking-widest">Online</span>
                </div>
            </div>
        </main>
    );
}
