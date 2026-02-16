import { Card } from "@bolglass/ui";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Ustawienia Konta</h1>
                <p className="text-gray-500 text-sm">Zarządzaj hasłem i powiadomieniami.</p>
            </div>

            <Card className="p-12 text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-full w-fit mx-auto">
                    <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium italic">Ta sekcja jest w trakcie przygotowania.</p>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    W przygotowaniu: zmiana hasła, ustawienia prywatności oraz preferencje powiadomień.
                </p>
            </Card>
        </div>
    );
}
