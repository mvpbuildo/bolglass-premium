import type { NextAuthConfig } from "next-auth"

import Google from "next-auth/providers/google"

export default {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                session.user.role = token.role as string
            }
            if (token.provider && session.user) {
                (session.user as any).provider = token.provider as string
            }
            return session
        },
        async jwt({ token, user, account }) {
            // When signing in, user object is available
            if (user) {
                token.role = (user as any).role
            }
            if (account) {
                token.provider = account.provider
            }
            return token
        }
    },
} satisfies NextAuthConfig
