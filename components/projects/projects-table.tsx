'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
  const [selectedProjectCode, setSelectedProjectCode] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(
        projects
          .map((project) => project.description?.trim() ?? '')
          .filter((year) => year.length > 0)
      )
    ).sort((left, right) => right.localeCompare(left));
  }, [projects]);

  const filteredProjectCodeOptions = useMemo(() => {
    const projectsForSelectedYear = selectedYear
      ? projects.filter((project) => (project.description?.trim() ?? '') === selectedYear)
      : projects;

    return Array.from(
      new Set(projectsForSelectedYear.map((project) => project.project_code))
    ).sort((left, right) => left.localeCompare(right));
  }, [projects, selectedYear]);

  useEffect(() => {
    if (!selectedProjectCode) {
      return;
    }

    if (!filteredProjectCodeOptions.includes(selectedProjectCode)) {
      setSelectedProjectCode('');
    }
  }, [filteredProjectCodeOptions, selectedProjectCode]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesProjectCode =
        !selectedProjectCode || project.project_code === selectedProjectCode;
      const matchesYear =
        !selectedYear || (project.description?.trim() ?? '') === selectedYear;

      return matchesProjectCode && matchesYear;
    });
  }, [projects, selectedProjectCode, selectedYear]);

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Lọc theo năm thi công</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Tất cả năm</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

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
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left font-medium">Năm</th>
            <th className="px-4 py-2 text-left font-medium">Mã dự án</th>
            <th className="px-4 py-2 text-left font-medium">Tên dự án</th>
            <th className="px-4 py-2 text-left font-medium">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredProjects.map((project) => (
            <tr key={project.id} className="border-b hover:bg-muted/30 transition">
              <td className="px-4 py-2 align-middle">{project.description}</td>
              <td className="px-4 py-2 align-middle">{project.project_code}</td>
              <td className="px-4 py-2 align-middle">{project.project_name}</td>
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

          {filteredProjects.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                Không có dự án phù hợp bộ lọc.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
