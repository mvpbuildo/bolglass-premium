import ConfiguratorSettings from '@/components/admin/ConfiguratorSettings';

export default function AdminSim3DSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Ustawienia 3D (Konfigurator)</h1>
            </div>
            <ConfiguratorSettings />
        </div>
    );
}
