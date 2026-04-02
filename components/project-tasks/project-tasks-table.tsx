type Task = {
  id: string;
  task_name: string;
  description: string | null;
  projects: {
    project_code: string;
    project_name: string;
  } | null;
};

type Props = {
  tasks: Task[];
};

export default function ProjectTasksTable({ tasks }: Props) {
  return (
    <div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left font-medium">Dự án</th>
            <th className="px-4 py-2 text-left font-medium">Hạng mục</th>
            <th className="px-4 py-2 text-left font-medium">Mô tả</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-b hover:bg-muted/30 transition">
              <td className="px-4 py-2 align-middle">
                {t.projects
                  ? `${t.projects.project_code} - ${t.projects.project_name}`
                  : ''}
              </td>
              <td className="px-4 py-2 align-middle">{t.task_name}</td>
              <td className="px-4 py-2 align-middle">{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}