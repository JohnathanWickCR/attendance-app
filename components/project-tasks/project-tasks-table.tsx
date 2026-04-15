'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
  const [selectedProjectCode, setSelectedProjectCode] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');

  const filteredProjectCodeOptions = useMemo(() => {
    const tasksForSelectedProjectName = selectedProjectName
      ? tasks.filter((task) => task.project_name === selectedProjectName)
      : tasks;

    return Array.from(
      new Set(tasksForSelectedProjectName.map((task) => task.project_code))
    ).sort((left, right) => left.localeCompare(right));
  }, [tasks, selectedProjectName]);

  const filteredProjectNameOptions = useMemo(() => {
    const tasksForSelectedProjectCode = selectedProjectCode
      ? tasks.filter((task) => task.project_code === selectedProjectCode)
      : tasks;

    return Array.from(
      new Set(tasksForSelectedProjectCode.map((task) => task.project_name))
    ).sort((left, right) => left.localeCompare(right));
  }, [tasks, selectedProjectCode]);

  useEffect(() => {
    if (!selectedProjectCode) {
      return;
    }

    if (!filteredProjectCodeOptions.includes(selectedProjectCode)) {
      setSelectedProjectCode('');
    }
  }, [filteredProjectCodeOptions, selectedProjectCode]);

  useEffect(() => {
    if (!selectedProjectName) {
      return;
    }

    if (!filteredProjectNameOptions.includes(selectedProjectName)) {
      setSelectedProjectName('');
    }
  }, [filteredProjectNameOptions, selectedProjectName]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesProjectCode =
        !selectedProjectCode || task.project_code === selectedProjectCode;
      const matchesProjectName =
        !selectedProjectName || task.project_name === selectedProjectName;

      return matchesProjectCode && matchesProjectName;
    });
  }, [tasks, selectedProjectCode, selectedProjectName]);

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Lọc theo mã dự án</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedProjectCode}
            onChange={(e) => setSelectedProjectCode(e.target.value)}
          >
            <option value="">Tất cả mã dự án</option>
            {filteredProjectCodeOptions.map((projectCode) => (
              <option key={projectCode} value={projectCode}>
                {projectCode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Lọc theo tên dự án</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedProjectName}
            onChange={(e) => setSelectedProjectName(e.target.value)}
          >
            <option value="">Tất cả tên dự án</option>
            {filteredProjectNameOptions.map((projectName) => (
              <option key={projectName} value={projectName}>
                {projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filteredTasks.map((task) => (
          <div key={task.id} className="rounded-xl border p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Mã dự án</p>
                <p className="font-medium">{task.project_code}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tên dự án</p>
                <p className="font-medium">{task.project_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hạng mục</p>
                <p className="font-medium">{task.task_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mô tả</p>
                <p className="font-medium">{task.description || '-'}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href={`/project-tasks?edit=${task.id}`}
                className="rounded bg-blue-600 px-3 py-2 text-center text-sm text-white"
              >
                Sửa
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(task.id)}
                disabled={deletingId === task.id}
                className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {deletingId === task.id ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border px-4 py-6 text-center text-sm text-muted-foreground">
            Không có hạng mục phù hợp bộ lọc.
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">Mã dự án</th>
              <th className="px-4 py-2 text-left font-medium">Tên dự án</th>
              <th className="px-4 py-2 text-left font-medium">Hạng mục</th>
              <th className="px-4 py-2 text-left font-medium">Mô tả</th>
              <th className="px-4 py-2 text-left font-medium">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-b transition hover:bg-muted/30">
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

            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                  Không có hạng mục phù hợp bộ lọc.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
