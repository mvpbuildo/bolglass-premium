import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@bolglass/database"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                // @ts-ignore
                session.user.role = token.role as string
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
    ...authConfig,
})
