'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

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
  const [importing, setImporting] = useState(false);

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

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setImporting(true);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        alert('File Excel không có sheet nào.');
        return;
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
        header: 1,
        blankrows: false,
      });

      if (rows.length < 2) {
        alert('File Excel phải có ít nhất 1 dòng dữ liệu dưới hàng tiêu đề.');
        return;
      }

      const dataRows = rows
        .slice(1)
        .map((row) => ({
          project_code: String(row[0] ?? '').trim(),
          task_name: String(row[1] ?? '').trim(),
        }))
        .filter((row) => row.project_code || row.task_name);

      if (dataRows.length === 0) {
        alert('Không tìm thấy dữ liệu hợp lệ trong file Excel.');
        return;
      }

      const response = await fetch('/api/project-tasks/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: dataRows }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error ?? 'Import thất bại.');
        return;
      }

      const errorPreview =
        Array.isArray(result.errors) && result.errors.length > 0
          ? `\n\nCác dòng bỏ qua:\n${result.errors
              .slice(0, 10)
              .map(
                (item: { rowNumber: number; reason: string }) =>
                  `- Dòng ${item.rowNumber}: ${item.reason}`
              )
              .join('\n')}`
          : '';

      alert(
        `Import hoàn tất.\nTạo mới: ${result.createdCount}\nBỏ qua: ${result.skippedCount}${errorPreview}`
      );

      window.location.reload();
    } catch (error) {
      alert('Lỗi đọc file Excel: ' + String(error));
    } finally {
      event.target.value = '';
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      {!editingTask ? (
        <div className="rounded border p-4">
          <div className="mb-3">
            <h3 className="font-semibold">Import từ Excel</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              File cần có 2 cột theo thứ tự: <strong>Mã dự án</strong> và{' '}
              <strong>Tên hạng mục</strong>.
            </p>
          </div>

          <label className="block text-sm font-medium">Chọn file Excel</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportFile}
            disabled={importing}
            className="mt-2 block w-full rounded border p-2 text-sm"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Hệ thống sẽ bỏ qua các dòng trùng hạng mục trong cùng mã dự án hoặc mã
            dự án không tồn tại.
          </p>

          {importing ? (
            <p className="mt-3 text-sm font-medium">Đang import file Excel...</p>
          ) : null}
        </div>
      ) : null}

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
    </div>
  );
}
