'use client';

import { useEffect, useMemo, useState } from 'react';

type Worker = {
  id: string;
  worker_code: string;
  full_name: string;
};

type Project = {
  id: string;
  project_code: string;
  project_name: string;
};

type Task = {
  id: string;
  project_id: string;
  task_name: string;
};

type EditingAttendance = {
  id: string;
  work_date: string;
  worker_id: string;
  project_id: string;
  task_id: string;
  regular_hours: number;
  overtime_hours: number;
  note: string | null;
};

type Props = {
  workers: Worker[];
  projects: Project[];
  tasks: Task[];
  editingAttendance: EditingAttendance | null;
  onCancelEdit?: () => void;
};

export default function AttendanceForm({
  workers,
  projects,
  tasks,
  editingAttendance,
  onCancelEdit,
}: Props) {
  const [form, setForm] = useState({
    work_date: '',
    worker_id: '',
    project_id: '',
    task_id: '',
    regular_hours: 8,
    overtime_hours: 0,
    note: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAttendance) {
      setForm({
        work_date: editingAttendance.work_date,
        worker_id: editingAttendance.worker_id,
        project_id: editingAttendance.project_id,
        task_id: editingAttendance.task_id,
        regular_hours: editingAttendance.regular_hours,
        overtime_hours: editingAttendance.overtime_hours,
        note: editingAttendance.note || '',
      });
    } else {
      setForm({
        work_date: '',
        worker_id: '',
        project_id: '',
        task_id: '',
        regular_hours: 8,
        overtime_hours: 0,
        note: '',
      });
    }
  }, [editingAttendance]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task.project_id === form.project_id);
  }, [tasks, form.project_id]);

  function validateForm() {
    if (!form.work_date) {
      alert('Vui lòng chọn ngày làm');
      return false;
    }
    if (!form.worker_id) {
      alert('Vui lòng chọn công nhân');
      return false;
    }
    if (!form.project_id) {
      alert('Vui lòng chọn dự án');
      return false;
    }
    if (!form.task_id) {
      alert('Vui lòng chọn hạng mục');
      return false;
    }
    if (form.regular_hours < 0) {
      alert('Giờ làm không được âm');
      return false;
    }
    if (form.overtime_hours < 0) {
      alert('Giờ tăng ca không được âm');
      return false;
    }
    if (form.regular_hours + form.overtime_hours > 24) {
      alert('Tổng giờ làm và tăng ca không được vượt quá 24 giờ');
      return false;
    }

    const selectedTask = tasks.find((task) => task.id === form.task_id);
    if (!selectedTask || selectedTask.project_id !== form.project_id) {
      alert('Hạng mục không thuộc dự án đã chọn');
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const isEditing = !!editingAttendance;

      const res = await fetch('/api/attendance', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEditing ? { id: editingAttendance.id, ...form } : form
        ),
      });

      const data = await res.json();

      if (res.ok) {
        alert(isEditing ? 'Cập nhật chấm công thành công' : 'Chấm công thành công');
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
  if (onCancelEdit) {
    onCancelEdit();
  } else {
    window.location.href = '/attendance';
  }
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
        value={form.worker_id}
        onChange={(e) => setForm({ ...form, worker_id: e.target.value })}
      >
        <option value="">Chọn công nhân</option>
        {workers.map((w) => (
          <option key={w.id} value={w.id}>
            {w.worker_code} - {w.full_name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 w-full"
        value={form.project_id}
        onChange={(e) =>
          setForm({
            ...form,
            project_id: e.target.value,
            task_id: '',
          })
        }
      >
        <option value="">Chọn dự án</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.project_code} - {p.project_name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 w-full"
        value={form.task_id}
        onChange={(e) => setForm({ ...form, task_id: e.target.value })}
      >
        <option value="">Chọn hạng mục</option>
        {filteredTasks.map((t) => (
          <option key={t.id} value={t.id}>
            {t.task_name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        className="border p-2 w-full"
        placeholder="Giờ làm"
        value={form.regular_hours}
        onChange={(e) =>
          setForm({ ...form, regular_hours: Number(e.target.value) })
        }
      />

      <input
        type="number"
        min="0"
        className="border p-2 w-full"
        placeholder="Giờ tăng ca"
        value={form.overtime_hours}
        onChange={(e) =>
          setForm({ ...form, overtime_hours: Number(e.target.value) })
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