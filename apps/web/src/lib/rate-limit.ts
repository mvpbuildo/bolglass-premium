export class RateLimiter {
    // blockStore: { [key]: blockedUntil (timestamp in ms) }
    private blockStore: Map<string, number> = new Map();
    // attemptStore: { [key]: { count, firstAttempt (timestamp in ms) } }
    private attemptStore: Map<string, { count: number; firstAttempt: number }> = new Map();

    private readonly maxAttempts: number;
    private readonly windowMs: number;
    private readonly blockDurationMs: number;

    constructor({
        maxAttempts = 5,
        windowMs = 60 * 1000, // 1 minuta
        blockDurationMs = 15 * 60 * 1000, // 15 minut
    }) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.blockDurationMs = blockDurationMs;

        // Cleanup co 5 minut by unikać wycieków RAM
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Zwraca true jeśli zapytanie jest PUSZCZONE DALEJ.
     * Zwraca false i wyrzuca błąd, jeśli zablokowano (Too Many Requests).
     */
    public consume(key: string): { success: boolean; blockedUntil?: Date } {
        const now = Date.now();

        // 1. Sprawdź, czy klucz nie jest już permanentnie zablokowany
        if (this.blockStore.has(key)) {
            const blockedUntil = this.blockStore.get(key)!;
            if (now < blockedUntil) {
                return { success: false, blockedUntil: new Date(blockedUntil) };
            } else {
                // Blokada minęła, usuwamy
                this.blockStore.delete(key);
            }
        }

        // 2. Aktualizacja prób dla algorytmu Token Bucket (lub stałego okna)
        const tracker = this.attemptStore.get(key);

        if (!tracker) {
            this.attemptStore.set(key, { count: 1, firstAttempt: now });
            return { success: true };
        }

        if (now - tracker.firstAttempt > this.windowMs) {
            // Próby wygasły w danym oknie, zacznij zliczać od nowa
            this.attemptStore.set(key, { count: 1, firstAttempt: now });
            return { success: true };
        }

        tracker.count += 1;

        if (tracker.count > this.maxAttempts) {
            // Przekroczono limit, nałóż blokadę!
            const blockedUntil = now + this.blockDurationMs;
            this.blockStore.set(key, blockedUntil);
            this.attemptStore.delete(key); // Resetujemy próby po blokadzie
            return { success: false, blockedUntil: new Date(blockedUntil) };
        }

        // Aktualizujemy ilość prób
        this.attemptStore.set(key, tracker);
        return { success: true };
    }

    private cleanup() {
        const now = Date.now();
        // Czyszczenie wygasłych blokad z RAM
        for (const [key, blockedUntil] of this.blockStore.entries()) {
            if (now >= blockedUntil) {
                this.blockStore.delete(key);
            }
        }
        // Czyszczenie zdezaktualizowanych prób 
        for (const [key, tracker] of this.attemptStore.entries()) {
            if (now - tracker.firstAttempt > this.windowMs) {
                this.attemptStore.delete(key);
            }
        }
    }
}

// Inicjalizacja instancji globalnej RateLimitera (Singleton cache)
export const loginRateLimiter = new RateLimiter({
    maxAttempts: 5,
    windowMs: 60 * 1000,          // 1 minutowa klatka dla 5 błędów
    blockDurationMs: 15 * 60 * 1000 // Blokada na kwadrans
});
