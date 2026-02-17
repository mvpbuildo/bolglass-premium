import Link from 'next/link';
import { Button } from '@bolglass/ui';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
            <h2 className="text-4xl font-bold">404</h2>
            <p className="text-xl text-gray-600">Page Not Found</p>
            <p className="text-gray-500">Could not find requested resource</p>
            <Link href="/">
                <Button variant="outline">Return Home</Button>
            </Link>
        </div>
    );
}
