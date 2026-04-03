'use client';

import { useEffect, useMemo, useState } from 'react';

export type ProjectOption = {
  id: string;
  project_code: string;
  project_name: string;
};

export type EditingTask = {
  id: string;
  project_id: string;
  task_name: string;
  description: string;
};

type Props = {
  projects: ProjectOption[];
  editingTask: EditingTask | null;
};

export default function ProjectTaskForm({ projects, editingTask }: Props) {
  const [form, setForm] = useState({
    project_code: '',
    project_id: '',
    task_name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const editingProject = editingTask
      ? projects.find((project) => project.id === editingTask.project_id) ?? null
      : null;

    if (editingTask) {
      setForm({
        project_code: editingProject?.project_code ?? '',
        project_id: editingTask.project_id,
        task_name: editingTask.task_name,
        description: editingTask.description,
      });
      return;
    }

    setForm({
      project_code: '',
      project_id: '',
      task_name: '',
      description: '',
    });
  }, [editingTask, projects]);

  const projectCodeOptions = useMemo(() => {
    return Array.from(new Set(projects.map((project) => project.project_code))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [projects]);

  const customerOptions = useMemo(() => {
    return projects.filter((project) => project.project_code === form.project_code);
  }, [projects, form.project_code]);

  useEffect(() => {
    if (!form.project_code) {
      if (form.project_id) {
        setForm((currentForm) => ({
          ...currentForm,
          project_id: '',
        }));
      }
      return;
    }

    const currentProjectStillMatches = customerOptions.some(
      (project) => project.id === form.project_id
    );

    if (currentProjectStillMatches) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      project_id: customerOptions[0]?.id ?? '',
    }));
  }, [customerOptions, form.project_code, form.project_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await fetch('/api/project-tasks', {
        method: editingTask ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTask ? { id: editingTask.id, ...form } : form),
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingTask ? 'Cập nhật hạng mục thành công' : 'Tạo hạng mục thành công');
        window.location.reload();
      } else {
        alert(JSON.stringify(data));
      }
    } catch (error) {
      alert('Lỗi fetch: ' + String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">
          {editingTask ? 'Sửa hạng mục' : 'Thêm hạng mục cho dự án'}
        </h2>

        {editingTask ? (
          <button
            type="button"
            onClick={() => {
              window.location.href = '/project-tasks';
            }}
            className="rounded border px-3 py-1"
          >
            Hủy
          </button>
        ) : null}
      </div>

      <select
        className="border p-2 w-full"
        value={form.project_code}
        onChange={(e) =>
          setForm({
            ...form,
            project_code: e.target.value,
          })
        }
      >
        <option value="">Chọn mã dự án</option>
        {projectCodeOptions.map((projectCode) => (
          <option key={projectCode} value={projectCode}>
            {projectCode}
          </option>
        ))}
      </select>

      <input
        placeholder="Tên hạng mục"
        className="border p-2 w-full"
        value={form.task_name}
        onChange={(e) => setForm({ ...form, task_name: e.target.value })}
      />

      <textarea
        placeholder="Mô tả"
        className="border p-2 w-full"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <button
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Đang lưu...' : editingTask ? 'Cập nhật' : 'Lưu'}
      </button>
    </form>
  );
}
