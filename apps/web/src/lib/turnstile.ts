export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        console.warn('TURNSTILE_SECRET_KEY is not defined. Skipping verification (devmode).');
        return true; // Domyślnie przepuszczamy, jeżeli klient nie ma jeszcze skonfigurowanego środowiska
    }

    if (!token) {
        console.warn('Turnstile Token is empty, but TURNSTILE_SECRET_KEY is defined. Blocking request.');
        return false;
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
