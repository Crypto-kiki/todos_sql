// src/app/api/users.route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// bcrypt
const SALT_ROUNDS = 10; // 10~15정도가 적당. 높으면 연산 오래걸림.

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (password.length < 6) {
    return NextResponse.json(
      {
        seccess: false,
        error: "비밀번호는 최소 6자리 이상이여야 합니다.",
      },
      { status: 400 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        // 응답시 hashedPassword 제외
        id: true,
        name: true,
        email: true,
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
