import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Hasło", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Note: We need to import prisma here dynamically or use a different approach
                // because auth.config.ts is used in middleware (Edge) where Prisma Client doesn't work.
                // However, the authorize callback is only called on the server (Node.js).
                // But importing it at top level breaks middleware.
                // Solution: Separate auth.config (Edge) and auth.ts (Node).
                // OR: Since we are not using Edge DB, we can just return null here and handle logic in auth.ts
                // actually, authorize IS called in Node.
                return null;
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
} satisfies NextAuthConfig
