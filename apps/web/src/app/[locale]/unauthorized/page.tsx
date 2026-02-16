import { Button, Card } from "@bolglass/ui";
import { Link } from "@/i18n/navigation";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md p-8 text-center space-y-6 bg-white shadow-xl rounded-2xl">
                <div className="bg-red-50 p-4 rounded-full w-fit mx-auto">
                    <ShieldAlert className="w-12 h-12 text-red-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Brak Uprawnień</h1>
                    <p className="text-gray-500">
                        Twoje konto nie posiada uprawnień administratora.
                        Jeśli uważasz, że to błąd, skontaktuj się z deweloperem.
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            Wróć do strony głównej
                        </Button>
                    </Link>
                    <form action="/api/auth/signout" method="POST">
                        <Button type="submit" variant="ghost" className="w-full text-red-600 hover:bg-red-50">
                            Wyloguj się i spróbuj ponownie
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
