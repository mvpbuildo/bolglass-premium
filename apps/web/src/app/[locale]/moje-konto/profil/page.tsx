import { prisma } from "@bolglass/database";
import { auth } from "@/auth";
import { Card } from "@bolglass/ui";
import ProfileForm from "./ProfileForm";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) return notFound();

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) return notFound();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mój Profil</h1>
                <p className="text-gray-500 text-sm">Zarządzaj swoimi danymi osobowymi i firmowymi.</p>
            </div>

            <Card className="p-8">
                <ProfileForm user={user as any} />
            </Card>
        </div>
    );
}
