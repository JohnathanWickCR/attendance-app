import { Suspense } from 'react';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Đang tải trang đăng nhập...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
