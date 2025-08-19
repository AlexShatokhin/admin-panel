import prisma from "@/lib/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                login: {label: "Login", type: "text", placeholder: "Login"},
                password: {label: "Password", type: "password", placeholder: "Password"}
            },
            async authorize(credentials) {
                if(credentials?.login && credentials?.password) {
                    const {login, password} = credentials;
                    const user = await prisma.user.findUnique({
                        where: { login }
                    });
                    if (user && await bcrypt.compare(password, user.password)) {
                        return user;
                    }
                }
                return null;
            },
        })
    ]
})

export {handler as POST, handler as GET};