import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-10">
      <Link href="/workers">Đi tới Workers</Link>
    </div>
  );
}