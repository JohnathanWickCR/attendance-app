'use client';

import Link from 'next/link';
import { useState } from 'react';

export type ProjectTaskRow = {
  id: string;
  project_id: string;
  task_name: string;
  description: string | null;
  project_code: string;
  project_name: string;
};

type Props = {
  tasks: ProjectTaskRow[];
};

export default function ProjectTasksTable({ tasks }: Props) {
  const [deletingId, setDeletingId] = useState('');

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Bạn có chắc muốn xóa hạng mục này không?');
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch('/api/project-tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Xóa hạng mục thành công');
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
            <th className="px-4 py-2 text-left font-medium">Mã dự án</th>
            <th className="px-4 py-2 text-left font-medium">Khách hàng</th>
            <th className="px-4 py-2 text-left font-medium">Hạng mục</th>
            <th className="px-4 py-2 text-left font-medium">Mô tả</th>
            <th className="px-4 py-2 text-left font-medium">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b hover:bg-muted/30 transition">
              <td className="px-4 py-2 align-middle">{task.project_code}</td>
              <td className="px-4 py-2 align-middle">{task.project_name}</td>
              <td className="px-4 py-2 align-middle">{task.task_name}</td>
              <td className="px-4 py-2 align-middle">{task.description}</td>
              <td className="px-4 py-2 align-middle whitespace-nowrap space-x-2">
                <Link
                  href={`/project-tasks?edit=${task.id}`}
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                >
                  Sửa
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  disabled={deletingId === task.id}
                  className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
                >
                  {deletingId === task.id ? 'Đang xóa...' : 'Xóa'}
                </button>
              </td>
            </tr>
          ))}

          {tasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                Chưa có hạng mục nào.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
