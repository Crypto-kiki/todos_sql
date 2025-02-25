// src/app/api/todos.route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

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
