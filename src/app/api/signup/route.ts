import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt"
import prisma from "@/lib/client";
import { RoleEnum } from "@/types/RoleEnum";

type RequestType = {
    login: string;
    password: string;
    name: string;
    role?: RoleEnum;

}
export async function POST(req: NextRequest){
    try {
        const {login, password, name, role = RoleEnum.WORKER} : RequestType = await req.json();
        const user = await prisma.user.findUnique({
            where: {login}
        });
        if(user)
            return NextResponse.json({error: "User already exists", message: "Пользователь с таким логином уже существует!"});

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                login,
                password: hashedPassword,
                name,
                role
            }
        })


        return NextResponse.json({error: null, message: "Пользователь успешно создан!"});
    } catch (e) {
        console.error(e);
        return NextResponse.json({error: "User creation error", message: "Ошибка при создании пользователя!"});
    }

}