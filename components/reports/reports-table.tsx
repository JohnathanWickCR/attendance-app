'use client';

import { useMemo, useState } from 'react';

export type ReportSourceRow = {
  project_year: string;
  project_code: string;
  project_name: string;
  task_name: string;
  worker_count: number;
  overtime_worker_count: number;
};

type Props = {
  rows: ReportSourceRow[];
};

export default function ReportsTable({ rows }: Props) {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedProjectCode, setSelectedProjectCode] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [selectedTaskName, setSelectedTaskName] = useState('');

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(rows.map((row) => row.project_year).filter((year) => year.length > 0))
    ).sort((left, right) => right.localeCompare(left));
  }, [rows]);

  const filteredProjectCodeOptions = useMemo(() => {
    const matchingRows = rows.filter((row) => {
      const matchesYear = !selectedYear || row.project_year === selectedYear;
      const matchesProjectName =
        !selectedProjectName || row.project_name === selectedProjectName;
      const matchesTaskName = !selectedTaskName || row.task_name === selectedTaskName;

      return matchesYear && matchesProjectName && matchesTaskName;
    });

    return Array.from(new Set(matchingRows.map((row) => row.project_code))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [rows, selectedYear, selectedProjectName, selectedTaskName]);

  const filteredProjectNameOptions = useMemo(() => {
    const matchingRows = rows.filter((row) => {
      const matchesYear = !selectedYear || row.project_year === selectedYear;
      const matchesProjectCode =
        !selectedProjectCode || row.project_code === selectedProjectCode;
      const matchesTaskName = !selectedTaskName || row.task_name === selectedTaskName;

      return matchesYear && matchesProjectCode && matchesTaskName;
    });

    return Array.from(new Set(matchingRows.map((row) => row.project_name))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [rows, selectedYear, selectedProjectCode, selectedTaskName]);

  const filteredTaskOptions = useMemo(() => {
    const matchingRows = rows.filter((row) => {
      const matchesYear = !selectedYear || row.project_year === selectedYear;
      const matchesProjectCode =
        !selectedProjectCode || row.project_code === selectedProjectCode;
      const matchesProjectName =
        !selectedProjectName || row.project_name === selectedProjectName;

      return matchesYear && matchesProjectCode && matchesProjectName;
    });

    return Array.from(new Set(matchingRows.map((row) => row.task_name))).sort(
      (left, right) => left.localeCompare(right)
    );
  }, [rows, selectedYear, selectedProjectCode, selectedProjectName]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesYear = !selectedYear || row.project_year === selectedYear;
      const matchesProjectCode =
        !selectedProjectCode || row.project_code === selectedProjectCode;
      const matchesProjectName =
        !selectedProjectName || row.project_name === selectedProjectName;
      const matchesTaskName = !selectedTaskName || row.task_name === selectedTaskName;

      return (
        matchesYear &&
        matchesProjectCode &&
        matchesProjectName &&
        matchesTaskName
      );
    });
  }, [rows, selectedYear, selectedProjectCode, selectedProjectName, selectedTaskName]);

  const aggregatedRows = useMemo(() => {
    const taskMap = new Map<
      string,
      {
        task_name: string;
        total_workers: number;
        total_overtime_workers: number;
      }
    >();

    for (const row of filteredRows) {
      const currentTask = taskMap.get(row.task_name) || {
        task_name: row.task_name,
        total_workers: 0,
        total_overtime_workers: 0,
      };

      currentTask.total_workers += Number(row.worker_count || 0);
      currentTask.total_overtime_workers += Number(row.overtime_worker_count || 0);
      taskMap.set(row.task_name, currentTask);
    }

    return Array.from(taskMap.values()).sort((left, right) =>
      left.task_name.localeCompare(right.task_name)
    );
  }, [filteredRows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Năm thi công</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedProjectCode('');
              setSelectedProjectName('');
              setSelectedTaskName('');
            }}
          >
            <option value="">Tất cả năm thi công</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Mã dự án</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedProjectCode}
            onChange={(e) => {
              setSelectedProjectCode(e.target.value);
              setSelectedProjectName('');
              setSelectedTaskName('');
            }}
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
          <label className="mb-1 block text-sm font-medium">Tên dự án</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={selectedProjectName}
            onChange={(e) => {
              setSelectedProjectName(e.target.value);
              setSelectedProjectCode('');
              setSelectedTaskName('');
            }}
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
          <label className="mb-1 block text-sm font-medium">Tên hạng mục</label>
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

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left font-medium">Hạng mục</th>
            <th className="px-4 py-2 text-left font-medium">Tổng số công nhân</th>
            <th className="px-4 py-2 text-left font-medium">Tổng số công nhân tăng ca</th>
          </tr>
        </thead>
        <tbody>
          {aggregatedRows.map((row) => (
            <tr key={row.task_name} className="border-b hover:bg-muted/30 transition">
              <td className="px-4 py-2 align-middle">{row.task_name}</td>
              <td className="px-4 py-2 align-middle">{row.total_workers}</td>
              <td className="px-4 py-2 align-middle">{row.total_overtime_workers}</td>
            </tr>
          ))}

          {aggregatedRows.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">
                Không có dữ liệu báo cáo phù hợp bộ lọc.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
