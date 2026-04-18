'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const queryErrorMessages: Record<string, string> = {
  config: 'Chưa cấu hình mật khẩu đăng nhập trên server.',
  unauthorized: 'Vui lòng đăng nhập để tiếp tục.',
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextTarget = searchParams.get('next') ?? '/attendance';
  const queryError = searchParams.get('error');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          next: nextTarget,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Đăng nhập thất bại.');
        return;
      }

      router.replace(data.redirectTo ?? '/attendance');
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Lỗi hệ thống.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div className="mb-5 space-y-1">
        <h1 className="text-2xl font-semibold">Đăng nhập</h1>
        <p className="text-sm text-slate-600">
          Nhập mật khẩu chung để vào hệ thống chấm công nội bộ.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border px-3 py-2 outline-none ring-0 focus:border-slate-950"
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
        />
      </div>

      {queryError ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {queryErrorMessages[queryError] ?? 'Không thể truy cập trang này.'}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Đang đăng nhập...' : 'Vào hệ thống'}
      </button>
    </form>
  );
}
