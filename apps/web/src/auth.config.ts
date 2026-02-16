import type { NextAuthConfig } from "next-auth"

export default {
    providers: [],
    pages: {
        signIn: "/login",
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
