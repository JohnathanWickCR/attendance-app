import { createClient } from '@/lib/supabase/server';

export default async function ProjectsTable() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left font-medium">Mã</th>
            <th className="px-4 py-2 text-left font-medium">Tên dự án</th>
            <th className="px-4 py-2 text-left font-medium">Mô tả</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((p) => (
            <tr key={p.id} className="border-b hover:bg-muted/30 transition">
              <td className="px-4 py-2 align-middle">{p.project_code}</td>
              <td className="px-4 py-2 align-middle">{p.project_name}</td>
              <td className="px-4 py-2 align-middle">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}