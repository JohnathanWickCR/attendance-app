'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type AttendanceRow = {
  id: string;
  work_date: string;
  regular_hours: number;
  overtime_hours: number;
  note: string | null;
  workers: {
    worker_code: string;
    full_name: string;
  } | null;
  projects: {
    project_code: string;
    project_name: string;
  } | null;
  project_tasks: {
    task_name: string;
  } | null;
};

type Props = {
  rows: AttendanceRow[];
};

export default function AttendanceTable({ rows }: Props) {
  const [selectedDate, setSelectedDate] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const filteredRows = useMemo(() => {
    if (!selectedDate) return rows;
    return rows.filter((row) => row.work_date === selectedDate);
  }, [rows, selectedDate]);

  const totalHours = useMemo(() => {
    return filteredRows.reduce((sum, row) => {
      return sum + Number(row.regular_hours || 0) + Number(row.overtime_hours || 0);
    }, 0);
  }, [filteredRows]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Bạn có chắc muốn xóa dòng chấm công này không?');
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch('/api/attendance', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Xóa thành công');
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-semibold">Danh sách chấm công</h2>
          <p className="text-sm text-muted-foreground">
            Tổng giờ hiển thị: <strong>{totalHours}</strong>
          </p>
        </div>

        <div className="min-w-[220px]">
          <label className="mb-1 block text-sm font-medium">Lọc theo ngày</label>
          <input
            type="date"
            className="w-full rounded border px-3 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left font-medium">Ngày</th>
            <th className="px-4 py-2 text-left font-medium">Công nhân</th>
            <th className="px-4 py-2 text-left font-medium">Dự án</th>
            <th className="px-4 py-2 text-left font-medium">Hạng mục</th>
            <th className="px-4 py-2 text-left font-medium">Giờ làm</th>
            <th className="px-4 py-2 text-left font-medium">Tăng ca</th>
            <th className="px-4 py-2 text-left font-medium">Ghi chú</th>
            <th className="px-4 py-2 text-left font-medium"></th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((r) => (
            <tr key={r.id} className="border-b hover:bg-muted/30 transition">
              <td className="px-4 py-2 align-middle">{r.work_date}</td>

              <td className="px-4 py-2 align-middle">
                {r.workers
                  ? `${r.workers.worker_code} - ${r.workers.full_name}`
                  : ''}
              </td>

              <td className="px-4 py-2 align-middle">
                {r.projects
                  ? `${r.projects.project_code} - ${r.projects.project_name}`
                  : ''}
              </td>

              <td className="px-4 py-2 align-middle">
                {r.project_tasks?.task_name || ''}
              </td>

              <td className="px-4 py-2 align-middle">{r.regular_hours}</td>
              <td className="px-4 py-2 align-middle">{r.overtime_hours}</td>
              <td className="px-4 py-2 align-middle">{r.note}</td>

              <td className="px-4 py-2 align-middle space-x-2 whitespace-nowrap">
                <Link
                  href={`/attendance?edit=${r.id}`}
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                >
                  Sửa
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
                >
                  {deletingId === r.id ? 'Đang xóa...' : 'Xóa'}
                </button>
              </td>
            </tr>
          ))}

          {filteredRows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-4 text-center text-muted-foreground">
                Không có dữ liệu chấm công cho ngày đã chọn.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}