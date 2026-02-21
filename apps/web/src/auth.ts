import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@bolglass/database"
import authConfig from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { verifyTurnstileToken } from "@/lib/turnstile"
import { loginRateLimiter } from "@/lib/rate-limit"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Hasło", type: "password" },
                turnstileToken: { label: "Turnstile Token", type: "text" }
            },
            authorize: async (credentials) => {
                const email = credentials?.email as string | undefined;
                if (!email) return null;

                // 1. Zabezpieczenie Rate Limit na wejściu oparte o email
                // Ze względu na uwarunkowania brzegowe Server Actions, jeżeli nie mamy tu dostępu do czystego IP (Headers),
                // uderzenia limitujemy per nazwa konta (Email), co i tak chroni docelowych użytkowników przed słownikami.
                // Jeżeli Twoja platforma Hostująca wspiera X-Forwarded-For transparentnie w `req.headers`,
                // można to rozszerzyć o IP (np. const ip = req?.headers?.get("x-forwarded-for")).
                const limitCheck = loginRateLimiter.consume(`login_attempt_${email.toLowerCase()}`);
                if (!limitCheck.success) {
                    throw new Error("RateLimitExceeded");
                }

                const turnstileToken = credentials?.turnstileToken as string | undefined;

                const isHuman = await verifyTurnstileToken(turnstileToken);
                if (!isHuman) {
                    console.error("Turnstile verification failed inside NextAuth");
                    return null;
                }

                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !(user as { password?: string }).password) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    (user as { password?: string }).password as string
                );

                if (passwordsMatch) {
                    return user;
                }

                return null;
            }
        })
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, account }) {
            if (user) {
                token.role = (user as { role?: string }).role
            }
            if (account) {
                token.provider = account.provider
            }

            if (user) return token

            if (!token.sub) return token

            // Optional: Re-fetch role from DB if needed for live updates, 
            // but for now relying on token.role set at login.
            // If token.role is missing, fetch it once.
            if (!token.role) {
                const existingUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                })
                if (existingUser) {
                    token.role = existingUser.role
                }
            }

            return token
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        }
    },
});
