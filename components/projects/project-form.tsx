'use client';

import { useEffect, useState } from 'react';

export type EditingProject = {
  id: string;
  project_code: string;
  project_name: string;
  description: string;
};

type Props = {
  editingProject: EditingProject | null;
  projectCodeOptions: string[];
};

export default function ProjectForm({
  editingProject,
  projectCodeOptions,
}: Props) {
  const [form, setForm] = useState({
    project_code: '',
    project_name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingProject) {
      setForm({
        project_code: editingProject.project_code,
        project_name: editingProject.project_name,
        description: editingProject.description,
      });
      return;
    }

    setForm({
      project_code: '',
      project_name: '',
      description: '',
    });
  }, [editingProject]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await fetch('/api/projects', {
        method: editingProject ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingProject ? { id: editingProject.id, ...form } : form
        ),
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingProject ? 'Cập nhật dự án thành công' : 'Tạo dự án thành công');
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
        <h2 className="font-bold">{editingProject ? 'Sửa dự án' : 'Thêm dự án'}</h2>

        {editingProject ? (
          <button
            type="button"
            onClick={() => {
              window.location.href = '/projects';
            }}
            className="rounded border px-3 py-1"
          >
            Hủy
          </button>
        ) : null}
      </div>

      <input
        list="project-code-options"
        placeholder="Mã dự án"
        className="border p-2 w-full"
        value={form.project_code}
        onChange={(e) => setForm({ ...form, project_code: e.target.value })}
      />
      <datalist id="project-code-options">
        {projectCodeOptions.map((projectCode) => (
          <option key={projectCode} value={projectCode} />
        ))}
      </datalist>

      <input
        placeholder="Tên khách hàng"
        className="border p-2 w-full"
        value={form.project_name}
        onChange={(e) => setForm({ ...form, project_name: e.target.value })}
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
        {loading ? 'Đang lưu...' : editingProject ? 'Cập nhật' : 'Lưu'}
      </button>
    </form>
  );
}
