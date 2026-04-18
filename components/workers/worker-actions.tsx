'use client';

import { useState } from 'react';

type WorkerRecord = {
  id: string;
  full_name: string;
};

export default function WorkerActions({ worker }: { worker: WorkerRecord }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const ok = window.confirm(`Xóa ${worker.full_name}?`);
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch('/api/workers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: worker.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert('Xóa thất bại: ' + (data.error ?? 'Lỗi hệ thống'));
        return;
      }

      alert('Đã xóa thành công');
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Có lỗi khi xóa: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    alert(`Sửa: ${worker.full_name}`);
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleEdit}
        className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
      >
        Sửa
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded bg-red-500 px-2 py-1 text-xs text-white disabled:opacity-50"
      >
        {loading ? 'Đang xóa...' : 'Xóa'}
      </button>
    </div>
  );
}
