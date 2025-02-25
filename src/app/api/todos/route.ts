// src/app/api/todos/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const userId = Number(searchParams.get("user-id"));

    if (isNaN(userId) || userId === 0) {
      throw new Error("유저 ID가 잘못되었습니다.");
    }

    const existUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existUser) {
      throw new Error("존재하지 않는 유저입니다.");
    }

    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
    });

    return NextResponse.json({ success: true, data: todos });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "할 일 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { content, userId } = await request.json();

  try {
    const todo = await prisma.todo.create({
      data: {
        content,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: todo });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "할 일 추가에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {}
