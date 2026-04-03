'use client';

import { useEffect, useMemo, useState } from 'react';

export type AttendanceProjectOption = {
  id: string;
  project_code: string;
  project_name: string;
};

export type AttendanceTaskOption = {
  id: string;
  project_id: string;
  project_code: string;
  task_name: string;
};

export type EditingAttendance = {
  id: string;
  work_date: string;
  project_code: string;
  project_id: string;
  task_id: string;
  worker_count: number;
  overtime_worker_count: number;
  note: string | null;
};

type Props = {
  projects: AttendanceProjectOption[];
  tasks: AttendanceTaskOption[];
  editingAttendance: EditingAttendance | null;
};

export default function AttendanceForm({
  projects,
  tasks,
  editingAttendance,
}: Props) {
  const [form, setForm] = useState({
    work_date: '',
    project_code: '',
    project_id: '',
    task_id: '',
    worker_count: 1,
    overtime_worker_count: 0,
    note: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const editingProject = editingAttendance
      ? projects.find((project) => project.id === editingAttendance.project_id) ?? null
      : null;

    if (editingAttendance) {
      setForm({
        work_date: editingAttendance.work_date,
        project_code: editingProject?.project_code ?? editingAttendance.project_code,
        project_id: editingAttendance.project_id,
        task_id: editingAttendance.task_id,
        worker_count: editingAttendance.worker_count,
        overtime_worker_count: editingAttendance.overtime_worker_count,
        note: editingAttendance.note || '',
      });
      return;
    }

    setForm({
      work_date: '',
      project_code: '',
      project_id: '',
      task_id: '',
      worker_count: 1,
      overtime_worker_count: 0,
      note: '',
    });
  }, [editingAttendance, projects]);

  const projectCodeOptions = useMemo(() => {
    return Array.from(new Set(projects.map((project) => project.project_code))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [projects]);

  const customerOptions = useMemo(() => {
    return projects.filter((project) => project.project_code === form.project_code);
  }, [projects, form.project_code]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task.project_code === form.project_code);
  }, [tasks, form.project_code]);

  function validateForm() {
    if (!form.work_date) {
      alert('Vui lòng chọn ngày làm');
      return false;
    }
    if (!form.project_code) {
      alert('Vui lòng chọn mã dự án');
      return false;
    }
    if (!form.project_id) {
      alert('Vui lòng chọn khách hàng');
      return false;
    }
    if (!form.task_id) {
      alert('Vui lòng chọn hạng mục');
      return false;
    }
    if (form.worker_count < 0) {
      alert('Số công nhân không được âm');
      return false;
    }
    if (form.overtime_worker_count < 0) {
      alert('Số công nhân tăng ca không được âm');
      return false;
    }
    if (form.overtime_worker_count > form.worker_count) {
      alert('Số công nhân tăng ca không được vượt số công nhân làm việc');
      return false;
    }

    const selectedTask = tasks.find((task) => task.id === form.task_id);
    if (!selectedTask || selectedTask.project_code !== form.project_code) {
      alert('Hạng mục không thuộc mã dự án đã chọn');
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/attendance', {
        method: editingAttendance ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingAttendance ? { id: editingAttendance.id, ...form } : form
        ),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          editingAttendance
            ? 'Cập nhật chấm công thành công'
            : 'Lưu chấm công thành công'
        );
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
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded bg-white">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">
          {editingAttendance ? 'Sửa chấm công' : 'Chấm công'}
        </h2>

        {editingAttendance ? (
          <button
            type="button"
            onClick={() => {
              window.location.href = '/attendance';
            }}
            className="rounded border px-3 py-1"
          >
            Hủy
          </button>
        ) : null}
      </div>

      <input
        type="date"
        className="border p-2 w-full"
        value={form.work_date}
        onChange={(e) => setForm({ ...form, work_date: e.target.value })}
      />

      <select
        className="border p-2 w-full"
        value={form.project_code}
        onChange={(e) =>
          setForm({
            ...form,
            project_code: e.target.value,
            project_id: '',
            task_id: '',
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

      <select
        className="border p-2 w-full"
        value={form.project_id}
        onChange={(e) => setForm({ ...form, project_id: e.target.value })}
        disabled={!form.project_code}
      >
        <option value="">Chọn khách hàng</option>
        {customerOptions.map((project) => (
          <option key={project.id} value={project.id}>
            {project.project_name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 w-full"
        value={form.task_id}
        onChange={(e) => setForm({ ...form, task_id: e.target.value })}
      >
        <option value="">Chọn hạng mục</option>
        {filteredTasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.task_name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        className="border p-2 w-full"
        placeholder="Số công nhân làm việc"
        value={form.worker_count}
        onChange={(e) =>
          setForm({ ...form, worker_count: Number(e.target.value) })
        }
      />

      <input
        type="number"
        min="0"
        className="border p-2 w-full"
        placeholder="Số công nhân tăng ca"
        value={form.overtime_worker_count}
        onChange={(e) =>
          setForm({ ...form, overtime_worker_count: Number(e.target.value) })
        }
      />

      <textarea
        className="border p-2 w-full"
        placeholder="Ghi chú"
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading
          ? editingAttendance
            ? 'Đang cập nhật...'
            : 'Đang lưu...'
          : editingAttendance
            ? 'Cập nhật'
            : 'Lưu chấm công'}
      </button>
    </form>
  );
}
