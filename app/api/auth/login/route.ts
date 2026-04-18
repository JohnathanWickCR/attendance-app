import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionDurationSeconds,
  isAuthConfigured,
  isValidLoginPassword,
  normalizeRedirectTarget,
} from '@/lib/auth';

const loginSchema = z.object({
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (!isAuthConfigured()) {
      return NextResponse.json(
        { error: 'Chưa cấu hình APP_LOGIN_PASSWORD trên server.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.parse(body);

    if (!isValidLoginPassword(parsed.password)) {
      return NextResponse.json(
        { error: 'Mật khẩu không đúng.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({
      success: true,
      redirectTo: normalizeRedirectTarget(parsed.next),
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: getSessionDurationSeconds(),
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Lỗi hệ thống.' }, { status: 500 });
  }
}
