import prisma from "@/lib/client";
import { RoleEnum } from "@/types/RoleEnum";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {

        const body : {
            name: string,
            login: string,
            password: string,
            role: RoleEnum
        } = await request.json();
        await prisma.user.create({
            data: {
                name: body.name,
                login: body.login,
                password: body.password,
                role: body.role
            }
        })

        return NextResponse.json({message: "Worker added successfully", error: null});

    } catch (error) {
        console.error(error);
        return NextResponse.json({message: "Error adding worker", error: error});
    }
} 