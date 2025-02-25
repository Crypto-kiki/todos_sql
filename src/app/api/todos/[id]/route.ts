// src/app/api/todos/[id]/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(
  _request: NextRequest, // _ 사용하지 않는다는 의미로 체크
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    // 권한 체크 : 해당 유저가 삭제를 시도하는지
    const todo = await prisma.todo.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, todoId: todo.id });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "할 일 삭제에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
