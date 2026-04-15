'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export type AttendanceRow = {
  id: string;
  work_date: string;
  worker_count: number;
  overtime_worker_count: number;
  note: string | null;
  project_id: string;
  task_id: string;
  project_code: string;
  project_name: string;
  task_name: string;
};

type Props = {
  rows: AttendanceRow[];
};

export default function AttendanceTable({ rows }: Props) {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedProjectCode, setSelectedProjectCode] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [selectedTaskName, setSelectedTaskName] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const rowsWithDateParts = useMemo(() => {
    return rows.map((row) => {
      const [year = '', month = '', day = ''] = row.work_date.split('-');

      return {
        ...row,
        year,
        month,
        day,
      };
    });
  }, [rows]);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(rowsWithDateParts.map((row) => row.year))).sort(
      (left, right) => right.localeCompare(left)
    );
  }, [rowsWithDateParts]);

  const filteredMonthOptions = useMemo(() => {
    const rowsForSelectedYear = selectedYear
      ? rowsWithDateParts.filter((row) => row.year === selectedYear)
      : rowsWithDateParts;

    return Array.from(new Set(rowsForSelectedYear.map((row) => row.month))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [rowsWithDateParts, selectedYear]);

  const filteredDayOptions = useMemo(() => {
    const rowsForSelectedYearAndMonth = rowsWithDateParts.filter((row) => {
      const matchesYear = !selectedYear || row.year === selectedYear;
      const matchesMonth = !selectedMonth || row.month === selectedMonth;

      return matchesYear && matchesMonth;
    });

    return Array.from(new Set(rowsForSelectedYearAndMonth.map((row) => row.day))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [rowsWithDateParts, selectedYear, selectedMonth]);

  const filteredProjectCodeOptions = useMemo(() => {
    const matchingRows = rowsWithDateParts.filter((row) => {
      const matchesYear = !selectedYear || row.year === selectedYear;
      const matchesMonth = !selectedMonth || row.month === selectedMonth;
      const matchesDay = !selectedDay || row.day === selectedDay;
      const matchesProjectName =
        !selectedProjectName || row.project_name === selectedProjectName;
      const matchesTaskName = !selectedTaskName || row.task_name === selectedTaskName;

      return (
        matchesYear &&
        matchesMonth &&
        matchesDay &&
        matchesProjectName &&
        matchesTaskName
      );
    });

    return Array.from(new Set(matchingRows.map((row) => row.project_code))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [
    rowsWithDateParts,
    selectedYear,
    selectedMonth,
    selectedDay,
    selectedProjectName,
    selectedTaskName,
  ]);

  const filteredProjectNameOptions = useMemo(() => {
    const matchingRows = rowsWithDateParts.filter((row) => {
      const matchesYear = !selectedYear || row.year === selectedYear;
      const matchesMonth = !selectedMonth || row.month === selectedMonth;
      const matchesDay = !selectedDay || row.day === selectedDay;
      const matchesProjectCode =
        !selectedProjectCode || row.project_code === selectedProjectCode;
      const matchesTaskName = !selectedTaskName || row.task_name === selectedTaskName;

      return (
        matchesYear &&
        matchesMonth &&
        matchesDay &&
        matchesProjectCode &&
        matchesTaskName
      );
    });

    return Array.from(new Set(matchingRows.map((row) => row.project_name))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [
    rowsWithDateParts,
    selectedYear,
    selectedMonth,
    selectedDay,
    selectedProjectCode,
    selectedTaskName,
  ]);

  const filteredTaskOptions = useMemo(() => {
    const matchingRows = rowsWithDateParts.filter((row) => {
      const matchesYear = !selectedYear || row.year === selectedYear;
      const matchesMonth = !selectedMonth || row.month === selectedMonth;
      const matchesDay = !selectedDay || row.day === selectedDay;
      const matchesProjectCode =
        !selectedProjectCode || row.project_code === selectedProjectCode;
      const matchesProjectName =
        !selectedProjectName || row.project_name === selectedProjectName;

      return (
        matchesYear &&
        matchesMonth &&
        matchesDay &&
        matchesProjectCode &&
        matchesProjectName
      );
    });

    return Array.from(new Set(matchingRows.map((row) => row.task_name))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [
    rowsWithDateParts,
    selectedYear,
    selectedMonth,
    selectedDay,
    selectedProjectCode,
    selectedProjectName,
  ]);

  useEffect(() => {
    if (selectedYear && !yearOptions.includes(selectedYear)) {
      setSelectedYear('');
    }
  }, [selectedYear, yearOptions]);

  useEffect(() => {
    if (selectedMonth && !filteredMonthOptions.includes(selectedMonth)) {
      setSelectedMonth('');
    }
  }, [selectedMonth, filteredMonthOptions]);

  useEffect(() => {
    if (selectedDay && !filteredDayOptions.includes(selectedDay)) {
      setSelectedDay('');
    }
  }, [selectedDay, filteredDayOptions]);

  useEffect(() => {
    if (selectedProjectCode && !filteredProjectCodeOptions.includes(selectedProjectCode)) {
      setSelectedProjectCode('');
    }
  }, [selectedProjectCode, filteredProjectCodeOptions]);

  useEffect(() => {
    if (selectedProjectName && !filteredProjectNameOptions.includes(selectedProjectName)) {
      setSelectedProjectName('');
    }
  }, [selectedProjectName, filteredProjectNameOptions]);

  useEffect(() => {
    if (selectedTaskName && !filteredTaskOptions.includes(selectedTaskName)) {
      setSelectedTaskName('');
    }
  }, [selectedTaskName, filteredTaskOptions]);

  const filteredRows = useMemo(() => {
    return rowsWithDateParts.filter((row) => {
      const matchesYear = !selectedYear || row.year === selectedYear;
      const matchesMonth = !selectedMonth || row.month === selectedMonth;
      const matchesDay = !selectedDay || row.day === selectedDay;
      const matchesProjectCode =
        !selectedProjectCode || row.project_code === selectedProjectCode;
      const matchesProjectName =
        !selectedProjectName || row.project_name === selectedProjectName;
      const matchesTaskName = !selectedTaskName || row.task_name === selectedTaskName;

      return (
        matchesYear &&
        matchesMonth &&
        matchesDay &&
        matchesProjectCode &&
        matchesProjectName &&
        matchesTaskName
      );
    });
  }, [
    rowsWithDateParts,
    selectedYear,
    selectedMonth,
    selectedDay,
    selectedProjectCode,
    selectedProjectName,
    selectedTaskName,
  ]);

  const totalWorkers = useMemo(() => {
    return filteredRows.reduce((sum, row) => sum + Number(row.worker_count || 0), 0);
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
            Tổng công nhân hiển thị: <strong>{totalWorkers}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Lọc theo năm</label>
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
          <label className="mb-1 block text-sm font-medium">Lọc theo tháng</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Tất cả tháng</option>
            {filteredMonthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Lọc theo ngày</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Tất cả ngày</option>
            {filteredDayOptions.map((day) => (
              <option key={day} value={day}>
                {day}
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

        <div>
          <label className="mb-1 block text-sm font-medium">Lọc theo tên dự án</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedProjectName}
            onChange={(e) => setSelectedProjectName(e.target.value)}
          >
            <option value="">Tất cả tên dự án</option>
            {filteredProjectNameOptions.map((projectName) => (
              <option key={projectName} value={projectName}>
                {projectName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Lọc theo hạng mục</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedTaskName}
            onChange={(e) => setSelectedTaskName(e.target.value)}
          >
            <option value="">Tất cả hạng mục</option>
            {filteredTaskOptions.map((taskName) => (
              <option key={taskName} value={taskName}>
                {taskName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filteredRows.map((row) => (
          <div key={row.id} className="rounded-xl border p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Ngày</p>
                <p className="font-medium">{row.work_date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mã dự án</p>
                <p className="font-medium">{row.project_code}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tên dự án</p>
                <p className="font-medium">{row.project_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hạng mục</p>
                <p className="font-medium">{row.task_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Số công nhân</p>
                <p className="font-medium">{row.worker_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tăng ca</p>
                <p className="font-medium">{row.overtime_worker_count}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Ghi chú</p>
                <p className="font-medium">{row.note || '-'}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href={`/attendance?edit=${row.id}`}
                className="rounded bg-blue-600 px-3 py-2 text-center text-sm text-white"
              >
                Sửa
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(row.id)}
                disabled={deletingId === row.id}
                className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {deletingId === row.id ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        ))}

        {filteredRows.length === 0 ? (
          <div className="rounded-xl border px-4 py-6 text-center text-sm text-muted-foreground">
            Không có dữ liệu chấm công phù hợp bộ lọc.
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">Ngày</th>
              <th className="px-4 py-2 text-left font-medium">Mã dự án</th>
              <th className="px-4 py-2 text-left font-medium">Tên dự án</th>
              <th className="px-4 py-2 text-left font-medium">Hạng mục</th>
              <th className="px-4 py-2 text-left font-medium">Số công nhân</th>
              <th className="px-4 py-2 text-left font-medium">Công nhân tăng ca</th>
              <th className="px-4 py-2 text-left font-medium">Ghi chú</th>
              <th className="px-4 py-2 text-left font-medium"></th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b transition hover:bg-muted/30">
                <td className="px-4 py-2 align-middle">{row.work_date}</td>
                <td className="px-4 py-2 align-middle">{row.project_code}</td>
                <td className="px-4 py-2 align-middle">{row.project_name}</td>
                <td className="px-4 py-2 align-middle">{row.task_name}</td>
                <td className="px-4 py-2 align-middle">{row.worker_count}</td>
                <td className="px-4 py-2 align-middle">{row.overtime_worker_count}</td>
                <td className="px-4 py-2 align-middle">{row.note}</td>
                <td className="px-4 py-2 align-middle space-x-2 whitespace-nowrap">
                  <Link
                    href={`/attendance?edit=${row.id}`}
                    className="rounded bg-blue-600 px-3 py-1 text-white"
                  >
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={deletingId === row.id}
                    className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
                  >
                    {deletingId === row.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-muted-foreground">
                  Không có dữ liệu chấm công phù hợp bộ lọc.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
