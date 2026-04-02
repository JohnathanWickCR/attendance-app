import Link from 'next/link';

const links = [
  { href: '/workers', label: 'Công nhân' },
  { href: '/projects', label: 'Dự án' },
  { href: '/project-tasks', label: 'Hạng mục' },
  { href: '/attendance', label: 'Chấm công' },
  { href: '/reports', label: 'Báo cáo' },
];

export default function MainNav() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl gap-4 p-4">
        <Link href="/" className="mr-4 font-bold">
          Attendance App
        </Link>

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded px-3 py-1 hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}