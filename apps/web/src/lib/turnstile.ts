export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
    if (!token) return false;

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        console.warn('TURNSTILE_SECRET_KEY is not defined. Skipping verification (devmode).');
        return true; // Domyślnie przepuszczamy, jeżeli klient nie ma jeszcze skonfigurowanego środowiska
    }

    try {
        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const data = await res.json();
        return data.success === true;
    } catch (err) {
        console.error('Turnstile verification error:', err);
        return false;
    }
}
