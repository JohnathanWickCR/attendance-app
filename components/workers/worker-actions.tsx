'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function WorkerActions({ worker }: any) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const ok = window.confirm(`Xóa ${worker.full_name}?`);
    if (!ok) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('workers')
        .delete()
        .eq('id', worker.id)
        .select();

      console.log('DELETE RESULT:', { data, error, workerId: worker.id });

      if (error) {
        alert('Xóa thất bại: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert('Không xóa được bản ghi này.');
        return;
      }

      alert('Đã xóa thành công');
      window.location.reload();
    } catch (err: any) {
      alert('Có lỗi khi xóa: ' + (err?.message || 'Unknown error'));
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