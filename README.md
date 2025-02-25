# install

## NextJS

- npx create-next-app to-do-list

## Prisma

- npm install prisma --save-dev
- npm install @prisma/client
- npx prisma init
- vscode prisma extension도 설치하기.
  **만약 extension이 적용되지 않는다면, 아래 코드 setting.json에 넣어보기**

```json
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

> npx prisma init 실행하면 .env파일 생성됨. Database_url 수정

```javascript
DATABASE_URL = "file:./dev.db";
```

- 아래 스키마에서 datasource db를 sqlite로 수정합니다.

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String
  todos    Todo[]
}

model Todo {
  id        Int     @id @default(autoincrement())
  content   String
  completed Boolean @default(false)
  userId    Int
  user      User    @relation(fields: [userId], references: [id])
}
```

## sqlite 설치

> brew install db-browser-for-sqlite

또는

> https://sqlitebrowser.org/dl/

# API

## Users

```typescript
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
```

#### 테스트

> npx prisma migrate dev --name init

마이그레이션 후 migrations, dev.db 생성되었는지 확인!

1. npm run dev
2. postman 실행
3. 빈 객체를 POST요청하면 아래와 같은 메세지 확인 할 수 있음
   > http://localhost:3000/api/users

```json
{
  "success": false,
  "error": "회원가입에 실패했습니다."
}
```

4. 정상 POST요청 보내보기

```json
{
  "name": "alice",
  "email": "alice@email.com",
  "password": "1234"
}
```

5. DB SQLite확인하기
   - DB SQLite실행 후, dev.db파일 열기
   - 정상요청 후 Browse Data에서 저장된 데이터들 확인해보기

## todos

### POST

```typescript
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
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: "Todo 등록에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
```

#### 테스트(POST)

> http://localhost:3000/api/todos

```json
{
  "content": "🧹 청소하기",
  "userId": 2
}
```

> sqlite에서 todo db확인

### GET

```typescript
// src/app/api/todos.route.ts
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
```

#### 테스트

- 존재하는 userId와 없는 userId를 조회해보기
  > http://localhost:3000/api/todos?user-id=1

### DELETE

```typescript
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
```

#### 테스트

> http://localhost:3000/api/todos/5

### 암호화(bcrypt)

> npm install bcrypt
> npm install --save-dev @types/bcrypt
