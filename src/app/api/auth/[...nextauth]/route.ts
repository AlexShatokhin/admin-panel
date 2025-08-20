import prisma from "@/lib/client";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { RoleEnum } from "@/types/RoleEnum";

const handler = NextAuth({
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 дней
    },
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
    ],
    callbacks: {
        async jwt({token, user}){
            console.log("JWT callback", token, user);
            if(user) {
                token.id = user.id;
                token.role = user.role || RoleEnum.WORKER;
                token.login = user.login;
                token.name = user.name;
            }
            return token;
        },
        async session({session, token}) {
            console.log("Session callback", session, token);
            if(token) {
                session.user.name = token.name;
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.login = token.login;
            }
            return session;
        }
    }
})

export {handler as POST, handler as GET};