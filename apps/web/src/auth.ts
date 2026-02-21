import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@bolglass/database"
import authConfig from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { verifyTurnstileToken } from "@/lib/turnstile"

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

                if (!user || !(user as any).password) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    (user as any).password
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
                token.role = (user as any).role
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
