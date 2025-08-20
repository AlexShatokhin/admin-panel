# Справочник по JWT и NextAuth в Next.js

## 1. Основы JWT (JSON Web Token)

### Что такое JWT?
JWT - это стандарт (RFC 7519) для безопасной передачи информации между сторонами в виде JSON объекта. Токен состоит из трех частей, разделенных точками:

```
header.payload.signature
```

### Структура JWT

**Header (Заголовок):**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Полезная нагрузка):**
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Signature (Подпись):**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Стандартные claims (поля):
- `iss` (issuer) - издатель токена
- `sub` (subject) - субъект токена
- `aud` (audience) - аудитория
- `exp` (expiration time) - время истечения
- `nbf` (not before) - не действителен до
- `iat` (issued at) - время выдачи
- `jti` (JWT ID) - уникальный идентификатор

## 2. Преимущества и недостатки JWT

### Преимущества:
- **Stateless** - не требует хранения сессий на сервере
- **Портативность** - можно использовать между различными доменами
- **Самодостаточность** - содержит всю необходимую информацию
- **Производительность** - не требует обращений к БД для проверки

### Недостатки:
- **Размер** - больше чем session ID
- **Отзыв токенов** - сложно отозвать до истечения
- **Безопасность** - если скомпрометирован secret, все токены под угрозой
- **Хранение** - нужно безопасно хранить на клиенте

## 3. Безопасность JWT

### Рекомендации:
- Используйте HTTPS
- Короткое время жизни токенов (15-30 минут)
- Реализуйте refresh токены
- Храните в httpOnly cookies или безопасном хранилище
- Валидируйте все claims
- Используйте сильные секреты

### Где НЕ хранить JWT:
- localStorage (уязвимо для XSS)
- sessionStorage (уязвимо для XSS)
- обычные cookies без флагов безопасности

### Безопасные места:
- httpOnly cookies с secure и sameSite флагами
- В памяти приложения (но теряется при перезагрузке)

## 4. NextAuth.js - Обзор

NextAuth.js - это полнофункциональная библиотека аутентификации для Next.js, которая абстрагирует сложности работы с JWT и сессиями.

### Ключевые особенности:
- Поддержка множества провайдеров (Google, GitHub, credentials и др.)
- Встроенная безопасность (CSRF защита, encrypted cookies)
- Гибкая конфигурация
- TypeScript поддержка
- Database и JWT session стратегии

## 5. JWT Strategy в NextAuth

### Когда использовать JWT сессии:
- Serverless окружения
- Масштабируемые приложения без состояния
- Мультидоменные приложения
- Когда нет постоянной БД

### Конфигурация JWT стратегии:
```typescript
// В файле [...nextauth]/route.ts
export default NextAuth({
  session: {
    strategy: "jwt", // Использовать JWT вместо database сессий
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  },
})
```

## 6. Callbacks в NextAuth

### JWT Callback:
Выполняется при создании/обновлении JWT токена.
```typescript
callbacks: {
  async jwt({ token, user, account }) {
    // Добавление данных в токен
    if (user) {
      token.role = user.role
    }
    return token
  }
}
```

### Session Callback:
Выполняется при получении сессии на клиенте.
```typescript
callbacks: {
  async session({ session, token }) {
    // Передача данных из токена в сессию
    session.user.role = token.role
    return session
  }
}
```

## 7. Провайдеры в NextAuth

### Credentials Provider:
Для кастомной логики аутентификации (логин/пароль).

### OAuth Providers:
Google, GitHub, Discord и др. для социальной авторизации.

### Настройка провайдера:
```typescript
providers: [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      // Ваша логика проверки учетных данных
      // Возвращает объект пользователя или null
    }
  })
]
```

## 8. Защита маршрутов

### Server-side (в API routes):
```typescript
import { getServerSession } from "next-auth/next"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Защищенная логика
}
```

### Client-side (в компонентах):
```typescript
import { useSession } from "next-auth/react"

export default function ProtectedComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (status === "unauthenticated") return <p>Access Denied</p>
  
  return <p>Welcome {session.user.email}</p>
}
```

## 9. Middleware для защиты маршрутов

Создайте `middleware.ts` в корне проекта:
```typescript
export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
}
```

## 10. Переменные окружения

Обязательные переменные в `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

Для продакшена NEXTAUTH_URL должен быть вашим доменом.

## 11. Типизация для TypeScript

Расширение типов NextAuth:
```typescript
// types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
  }
  
  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
  }
}
```

## 12. Рекомендации по архитектуре

### Для небольших приложений:
- Используйте JWT стратегию
- Credentials provider для простой авторизации
- Middleware для защиты маршрутов

### Для крупных приложений:
- Database стратегия для лучшего контроля
- Комбинируйте OAuth и Credentials провайдеры
- Реализуйте role-based авторизацию
- Используйте refresh токены

## 13. Отладка и мониторинг

### Debug режим:
```typescript
export default NextAuth({
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error(code, metadata)
    },
    warn(code) {
      console.warn(code)
    }
  }
})
```

---

# План реализации авторизации с NextAuth + JWT

## Фаза 1: Подготовка и установка

### 1.1 Установка зависимостей
```bash
npm install next-auth
npm install @next-auth/prisma-adapter  # если используете Prisma
npm install bcryptjs @types/bcryptjs   # для хеширования паролей
```

### 1.2 Настройка переменных окружения
Создать/обновить `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-very-long-random-secret-key-here
DATABASE_URL="your-database-connection-string"
```

**Генерация NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Фаза 2: Настройка базы данных (если используете Prisma)

### 2.1 Обновление Prisma схемы
Добавить модели для NextAuth в `schema.prisma`:
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   # для credentials
  role          String?   @default("USER")
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

### 2.2 Применение миграций
```bash
npx prisma migrate dev --name add-nextauth
npx prisma generate
```

## Фаза 3: Настройка NextAuth

### 3.1 Создание Prisma клиента
Файл: `src/lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3.2 Создание конфигурации NextAuth
Файл: `src/lib/auth.ts`
```typescript
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.role = token.role
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}
```

### 3.3 Создание API маршрута
Файл: `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

## Фаза 4: Типизация для TypeScript

### 4.1 Расширение типов NextAuth
Файл: `types/next-auth.d.ts`
```typescript
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
  }

  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}
```

## Фаза 5: API для регистрации

### 5.1 Создание API маршрута регистрации
Файл: `src/app/api/auth/register/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь уже существует" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    })

    return NextResponse.json(
      { message: "Пользователь создан", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
```

## Фаза 6: Настройка провайдеров

### 6.1 Создание SessionProvider
Файл: `src/components/providers/session-provider.tsx`
```typescript
"use client"

import { SessionProvider } from "next-auth/react"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### 6.2 Обертывание приложения
В `src/app/layout.tsx`:
```typescript
import AuthProvider from "@/components/providers/session-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Фаза 7: Защита маршрутов

### 7.1 Создание middleware
Файл: `middleware.ts` (в корне проекта)
```typescript
export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*"
  ]
}
```

### 7.2 Серверная защита API
```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Защищенная логика
}
```

## Фаза 8: Реализация форм

### 8.1 Форма логина
```typescript
"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(values: { email: string; password: string }) {
    setIsLoading(true)
    setError("")
    
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверный логин или пароль")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  // JSX формы...
}
```

### 8.2 Форма регистрации
```typescript
async function onSubmit(values: RegisterFormData) {
  setIsLoading(true)
  setError("")
  
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error)
    }

    // Автоматический вход после регистрации
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })
    
    router.push("/dashboard")
  } catch (error) {
    setError(error.message)
  } finally {
    setIsLoading(false)
  }
}
```

## Фаза 9: Использование сессий

### 9.1 В компонентах
```typescript
import { useSession } from "next-auth/react"

export default function UserProfile() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div>Загрузка...</div>
  if (status === "unauthenticated") return <div>Нет доступа</div>

  return <div>Привет, {session?.user?.name}!</div>
}
```

### 9.2 В Server Components
```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return <div>Добро пожаловать, {session.user.name}!</div>
}
```

## Фаза 10: Дополнительные компоненты

### 10.1 Кнопка выхода
```typescript
import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="..."
    >
      Выйти
    </button>
  )
}
```

### 10.2 Условный рендеринг
```typescript
import { useSession } from "next-auth/react"

export default function Navigation() {
  const { data: session } = useSession()

  return (
    <nav>
      {session ? (
        <UserMenu user={session.user} />
      ) : (
        <LoginButton />
      )}
    </nav>
  )
}
```

## Фаза 11: Продакшен чеклист

### 11.1 Безопасность
- [ ] NEXTAUTH_SECRET сгенерирован криптографически стойко
- [ ] HTTPS включен в продакшене
- [ ] Проверены все переменные окружения
- [ ] Настроены CORS политики
- [ ] Валидация всех входных данных

### 11.2 Производительность
- [ ] Настроено кэширование сессий
- [ ] Оптимизированы запросы к БД
- [ ] Настроен connection pooling

### 11.3 Мониторинг
- [ ] Логирование ошибок аутентификации
- [ ] Метрики использования
- [ ] Алерты на подозрительную активность

---

## Быстрый старт для нового проекта

1. **Установить зависимости:** `npm install next-auth bcryptjs @types/bcryptjs`
2. **Настроить .env:** Добавить NEXTAUTH_URL и NEXTAUTH_SECRET
3. **Создать auth.ts:** Конфигурация NextAuth
4. **Создать [...nextauth]/route.ts:** API маршрут
5. **Обернуть приложение в SessionProvider**
6. **Создать middleware.ts:** Защита маршрутов
7. **Реализовать формы логина/регистрации**

Этот план можно использовать как шаблон для каждого нового проекта, адаптируя под конкретные требования.
