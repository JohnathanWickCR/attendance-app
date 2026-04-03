'use client';

import Link from 'next/link';
import { useState } from 'react';

export type ProjectRow = {
  id: string;
  project_code: string;
  project_name: string;
  description: string | null;
};

type Props = {
  projects: ProjectRow[];
};

export default function ProjectsTable({ projects }: Props) {
  const [deletingId, setDeletingId] = useState('');

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Bạn có chắc muốn xóa dự án này không?');
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Xóa dự án thành công');
        window.location.reload();
      } else {
        alert(JSON.stringify(data));
      }
    } catch (error) {
      alert('Lỗi fetch: ' + String(error));
    } finally {
      setDeletingId('');
    }
  }

  return (
    <div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left font-medium">Mã</th>
            <th className="px-4 py-2 text-left font-medium">Khách hàng</th>
            <th className="px-4 py-2 text-left font-medium">Mô tả</th>
            <th className="px-4 py-2 text-left font-medium">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b hover:bg-muted/30 transition">
              <td className="px-4 py-2 align-middle">{project.project_code}</td>
              <td className="px-4 py-2 align-middle">{project.project_name}</td>
              <td className="px-4 py-2 align-middle">{project.description}</td>
              <td className="px-4 py-2 align-middle whitespace-nowrap space-x-2">
                <Link
                  href={`/projects?edit=${project.id}`}
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                >
                  Sửa
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(project.id)}
                  disabled={deletingId === project.id}
                  className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
                >
                  {deletingId === project.id ? 'Đang xóa...' : 'Xóa'}
                </button>
              </td>
            </tr>
          ))}

          {projects.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                Chưa có dự án nào.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
