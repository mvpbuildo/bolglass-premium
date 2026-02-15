import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@bolglass/database"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        // Placeholder for future Credential provider if needed
        // Credentials({ ... }) 
    ],
    session: {
        strategy: "jwt", // Easier for monorepos/serverless
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                // @ts-ignore
                session.user.role = token.role
            }
            return session
        },
        async jwt({ token }) {
            if (!token.sub) return token

            const existingUser = await prisma.user.findUnique({
                where: { id: token.sub },
            })

            if (!existingUser) return token

            // @ts-ignore
            token.role = existingUser.role
            return token
        }
    },
    pages: {
        signIn: "/login",
    },
})
