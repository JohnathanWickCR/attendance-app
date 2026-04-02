'use client';

import { useState } from 'react';

export default function ProjectForm() {
  const [form, setForm] = useState({
    project_code: '',
    project_name: '',
    description: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Tạo dự án thành công');
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
      <h2 className="font-bold">Thêm dự án</h2>

      <input
        placeholder="Mã dự án"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, project_code: e.target.value })}
      />

      <input
        placeholder="Tên dự án"
        className="border p-2 w-full"
        onChange={(e) => setForm({ ...form, project_name: e.target.value })}
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