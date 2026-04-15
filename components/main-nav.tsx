'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/projects', label: 'Dự án' },
  { href: '/project-tasks', label: 'Hạng mục' },
  { href: '/attendance', label: 'Chấm công' },
  { href: '/reports', label: 'Báo cáo' },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl gap-4 p-4">
        <Link href="/" className="mr-4 font-bold">
          SLB Workers
        </Link>

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
    </nav>
  );
}
