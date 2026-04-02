import { createClient } from '@/lib/supabase/server';

export default async function WorkersTable() {
  const supabase = await createClient();

  const { data } = await supabase.from('workers').select('*');

  return (
    <div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left font-medium">Mã</th>
            <th className="px-4 py-2 text-left font-medium">Tên</th>
            <th className="px-4 py-2 text-left font-medium">Đơn giá</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((w) => (
            <tr key={w.id} className="border-b hover:bg-muted/30 transition">
              <td className="px-4 py-2 align-middle">{w.worker_code}</td>
              <td className="px-4 py-2 align-middle">{w.full_name}</td>
              <td className="px-4 py-2 align-middle">{w.labor_rate_per_hour}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}