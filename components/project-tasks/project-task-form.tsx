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
    project_id: '',
    task_name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setForm({
        project_id: editingTask.project_id,
        task_name: editingTask.task_name,
        description: editingTask.description,
      });
      return;
    }

    setForm({
      project_id: '',
      task_name: '',
      description: '',
    });
  }, [editingTask]);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.id === form.project_id) ?? null;
  }, [projects, form.project_id]);

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
        value={form.project_id}
        onChange={(e) => setForm({ ...form, project_id: e.target.value })}
      >
        <option value="">Chọn mã dự án</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.project_code}
          </option>
        ))}
      </select>

      <input
        readOnly
        value={selectedProject?.project_name ?? ''}
        placeholder="Khách hàng"
        className="border p-2 w-full bg-slate-50"
      />

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
