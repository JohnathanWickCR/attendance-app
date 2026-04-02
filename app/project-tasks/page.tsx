import { createClient } from '@/lib/supabase/server';
import ProjectTaskForm from '@/components/project-tasks/project-task-form';
import ProjectTasksTable from '@/components/project-tasks/project-tasks-table';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';

export default async function ProjectTasksPage() {
  const supabase = await createClient();

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, project_code, project_name')
    .order('created_at', { ascending: false });

  if (projectsError) {
    throw new Error(projectsError.message);
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('project_tasks')
    .select(`
      id,
      task_name,
      description,
      projects (
        project_code,
        project_name
      )
    `)
    .order('created_at', { ascending: false });

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  return (
    <PageContainer
      title="Hạng mục dự án"
      description="Quản lý danh sách hạng mục và liên kết với các dự án."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Thêm hạng mục"
          description="Tạo hạng mục mới cho từng dự án."
          className="h-fit"
        >
          <ProjectTaskForm projects={projects || []} />
        </SectionCard>

        <SectionCard
          title="Danh sách hạng mục"
          description="Xem các hạng mục hiện có theo từng dự án."
        >
          <ProjectTasksTable tasks={(tasks as any[]) || []} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}