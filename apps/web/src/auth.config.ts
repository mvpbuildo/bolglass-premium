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
            return session
        },
        async jwt({ token, user }) {
            // When signing in, user object is available
            if (user) {
                token.role = (user as any).role
            }
            return token
        }
    },
} satisfies NextAuthConfig
