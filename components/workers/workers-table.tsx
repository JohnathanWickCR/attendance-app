import { createClient } from '@/lib/supabase/server';
import WorkerActions from './worker-actions';

export default async function WorkersTable() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('workers').select('*');

  if (error) {
    return <div>Lỗi tải danh sách công nhân</div>;
  }

  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left font-medium">Mã</th>
            <th className="px-4 py-2 text-left font-medium">Tên</th>
            <th className="px-4 py-2 text-left font-medium">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((w) => (
            <tr key={w.id} className="border-b transition hover:bg-muted/30">
              <td className="px-4 py-2 align-middle">{w.worker_code}</td>
              <td className="px-4 py-2 align-middle">{w.full_name}</td>
              <td className="px-4 py-2 align-middle">
                <WorkerActions worker={w} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}