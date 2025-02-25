// src/app/api/users.route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "회원가입에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
