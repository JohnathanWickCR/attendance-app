'use client';

import { useState } from 'react';

type Project = {
  id: string;
  project_code: string;
  project_name: string;
};

type Props = {
  projects: Project[];
};

export default function ProjectTaskForm({ projects }: Props) {
  const [form, setForm] = useState({
    project_id: '',
    task_name: '',
    description: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch('/api/project-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Tạo hạng mục thành công');
        window.location.reload();
      } else {
        alert(JSON.stringify(data));
      }
    } catch (error) {
      alert('Lỗi fetch: ' + String(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
      <h2 className="font-bold">Thêm hạng mục cho dự án</h2>

      <select
        className="border p-2 w-full"
        value={form.project_id}
        onChange={(e) => setForm({ ...form, project_id: e.target.value })}
      >
        <option value="">Chọn dự án</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.project_code} - {p.project_name}
          </option>
        ))}
      </select>

      <input
        placeholder="Tên hạng mục"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, task_name: e.target.value })}
      />

      <textarea
        placeholder="Mô tả"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <button className="bg-black text-white px-4 py-2 rounded">
        Lưu
      </button>
    </form>
  );
}