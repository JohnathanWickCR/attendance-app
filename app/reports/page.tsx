import { createClient } from '@/lib/supabase/server';
import ReportsTable, { type ReportSourceRow } from '@/components/reports/reports-table';
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
        project_name,
        description
      ),
      project_tasks (
        id,
        task_name
      )
    `);

  if (error) {
    throw new Error(error.message);
  }

  const reportRows: ReportSourceRow[] = [];

  for (const row of rows || []) {
    const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
    const task = Array.isArray(row.project_tasks) ? row.project_tasks[0] : row.project_tasks;

    if (!project || !task) continue;

    reportRows.push({
      project_year: project.description?.trim() ?? '',
      project_code: project.project_code,
      project_name: project.project_name,
      task_name: task.task_name,
      worker_count: Number(row.regular_hours || 0),
      overtime_worker_count: Number(row.overtime_hours || 0),
    });
  }

  return (
    <PageContainer
      title="Báo cáo"
      description="Tổng hợp số công nhân theo năm thi công, dự án và hạng mục."
    >
      <SectionCard title="Báo cáo tổng hợp">
        {reportRows.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Chưa có dữ liệu chấm công.
          </div>
        ) : (
          <ReportsTable rows={reportRows} />
        )}
      </SectionCard>
    </PageContainer>
  );
}
