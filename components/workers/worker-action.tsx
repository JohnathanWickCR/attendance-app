'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function WorkerActions({ worker }: any) {
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDelete = confirm('Xóa công nhân này?');
    if (!confirmDelete) return;

    await supabase.from('workers').delete().eq('id', worker.id);

    router.refresh(); // reload lại data
  };

  const handleEdit = () => {
    // tạm thời log ra, bước sau mình nối với form
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
        className="px-2 py-1 text-xs bg-red-500 text-white rounded"
      >
        Xóa
      </button>
    </div>
  );
}