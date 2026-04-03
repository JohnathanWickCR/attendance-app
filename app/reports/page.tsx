import { createClient } from '@/lib/supabase/server';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from('attendance_entries')
    .select(`
      id,
      regular_hours,
      overtime_hours,
      projects (
        id,
        project_code,
        project_name
      ),
      project_tasks (
        id,
        task_name
      )
    `);

  if (error) {
    throw new Error(error.message);
  }

  const projectMap = new Map<
    string,
    {
      project_code: string;
      project_name: string;
      total_workers: number;
      overtime_workers: number;
      tasks: Map<
        string,
        { task_name: string; total_workers: number; overtime_workers: number }
      >;
    }
  >();

  for (const row of rows || []) {
    const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
    const task = Array.isArray(row.project_tasks) ? row.project_tasks[0] : row.project_tasks;

    if (!project) continue;

    const workerCount = Number(row.regular_hours || 0);
    const overtimeWorkerCount = Number(row.overtime_hours || 0);

    const currentProject = projectMap.get(project.id) || {
      project_code: project.project_code,
      project_name: project.project_name,
      total_workers: 0,
      overtime_workers: 0,
      tasks: new Map<
        string,
        { task_name: string; total_workers: number; overtime_workers: number }
      >(),
    };

    currentProject.total_workers += workerCount;
    currentProject.overtime_workers += overtimeWorkerCount;

    if (task) {
      const currentTask = currentProject.tasks.get(task.id) || {
        task_name: task.task_name,
        total_workers: 0,
        overtime_workers: 0,
      };

      currentTask.total_workers += workerCount;
      currentTask.overtime_workers += overtimeWorkerCount;
      currentProject.tasks.set(task.id, currentTask);
    }

    projectMap.set(project.id, currentProject);
  }

  const reportRows = Array.from(projectMap.values());

  return (
    <PageContainer
      title="Báo cáo"
      description="Tổng hợp số công nhân theo dự án và hạng mục."
    >
      <SectionCard title="Tổng số công nhân theo dự án">
        {reportRows.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Chưa có dữ liệu chấm công.
          </div>
        ) : (
          <div className="space-y-4">
            {reportRows.map((project) => (
              <div
                key={project.project_code}
                className="rounded-xl border p-4 space-y-3"
              >
                <div>
                  <h2 className="text-base font-semibold">
                    {project.project_code} - {project.project_name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tổng công nhân: <strong>{project.total_workers}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Công nhân tăng ca: <strong>{project.overtime_workers}</strong>
                  </p>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Hạng mục</th>
                      <th className="text-left">Tổng công nhân</th>
                      <th className="text-left">Công nhân tăng ca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(project.tasks.values()).map((task) => (
                      <tr key={task.task_name}>
                        <td>{task.task_name}</td>
                        <td>{task.total_workers}</td>
                        <td>{task.overtime_workers}</td>
                      </tr>
                    ))}

                    {project.tasks.size === 0 ? (
                      <tr>
                        <td colSpan={3}>Chưa có dữ liệu hạng mục.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
