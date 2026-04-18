'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/projects', label: 'Dự án' },
  { href: '/project-tasks', label: 'Hạng mục' },
  { href: '/attendance', label: 'Chấm công' },
  { href: '/reports', label: 'Báo cáo' },
];

export default function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (pathname === '/login') {
    return null;
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      router.replace('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 p-4">
        <Link href="/" className="mr-2 font-bold">
          SLB Workers
        </Link>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-3 py-1 hover:bg-slate-100 ${
                pathname === link.href ? 'font-bold text-slate-950' : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded border px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          {isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}
        </button>
      </div>
    </nav>
  );
}
