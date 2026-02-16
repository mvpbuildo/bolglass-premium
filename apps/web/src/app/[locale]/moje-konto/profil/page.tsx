import { Card } from "@bolglass/ui";
import { User } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mój Profil</h1>
                <p className="text-gray-500 text-sm">Zarządzaj swoimi danymi osobowymi.</p>
            </div>

            <Card className="p-12 text-center space-y-4">
                <div className="bg-blue-50 p-4 rounded-full w-fit mx-auto">
                    <User className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-gray-700 font-medium italic">Ta sekcja jest w trakcie przygotowania.</p>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Wkrótce będziesz mógł tutaj zmienić swoje dane adresowe oraz numer telefonu.
                </p>
            </Card>
        </div>
    );
}
