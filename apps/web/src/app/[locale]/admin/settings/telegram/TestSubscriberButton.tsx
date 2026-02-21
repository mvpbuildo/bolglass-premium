'use client';

import { toast } from 'react-hot-toast';
import { sendTestTelegramMessage } from './actions';
import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function TestSubscriberButton({ chatId }: { chatId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleTest = async () => {
        setIsLoading(true);
        try {
            const result = await sendTestTelegramMessage(chatId);
            if (result.success) {
                toast.success('Powiadomienie testowe wysłane!');
            } else {
                toast.error(result.error || 'Błąd wysyłki testowej.');
            }
        } catch (e) {
            toast.error('Wystąpił błąd podczas testu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleTest}
            disabled={isLoading}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 disabled:opacity-50"
            title="Wyślij wiadomość testową"
        >
            <SendHorizontal className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
        </button>
    );
}
