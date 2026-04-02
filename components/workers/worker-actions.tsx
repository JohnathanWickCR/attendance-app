'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WorkerActions({ worker }: any) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = confirm(`Xóa ${worker.full_name}?`);
    if (!confirmDelete) return;

    setLoading(true);

    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', worker.id);

    setLoading(false);

    if (error) {
      alert('Xóa thất bại: ' + error.message);
      return;
    }

    router.refresh(); // reload lại danh sách
  };

  const handleEdit = () => {
    // bước sau sẽ nối form
    alert(`Sửa: ${worker.full_name}`);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleEdit}
        className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
      >
        Sửa
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-2 py-1 text-xs bg-red-500 text-white rounded disabled:opacity-50"
      >
        {loading ? '...' : 'Xóa'}
      </button>
    </div>
  );
}