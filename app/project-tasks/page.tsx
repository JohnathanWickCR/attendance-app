import { createClient } from '@/lib/supabase/server';
import ProjectTaskForm, {
  type EditingTask,
  type ProjectOption,
} from '@/components/project-tasks/project-task-form';
import ProjectTasksTable, {
  type ProjectTaskRow,
} from '@/components/project-tasks/project-tasks-table';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';

type SearchParams = Promise<{ edit?: string }>;

export default async function ProjectTasksPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
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
      project_id,
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

  const projectOptions: ProjectOption[] = (projects || []).map((project) => ({
    id: project.id,
    project_code: project.project_code,
    project_name: project.project_name,
  }));

  const taskRows: ProjectTaskRow[] = (tasks || []).map((task) => {
    const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;

    return {
      id: task.id,
      project_id: task.project_id,
      task_name: task.task_name,
      description: task.description,
      project_code: project?.project_code ?? '',
      project_name: project?.project_name ?? '',
    };
  });

  let editingTask: EditingTask | null = null;

  if (searchParams.edit) {
    const found = taskRows.find((task) => task.id === searchParams.edit);
    if (found) {
      editingTask = {
        id: found.id,
        project_id: found.project_id,
        task_name: found.task_name,
        description: found.description ?? '',
      };
    }
  }

  return (
    <PageContainer
      title="Hạng mục dự án"
      description="Quản lý danh sách hạng mục và liên kết với mã dự án."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title={editingTask ? 'Sửa hạng mục' : 'Thêm hạng mục'}
          description="Tạo hạng mục mới cho từng mã dự án."
          className="h-fit"
        >
          <ProjectTaskForm projects={projectOptions} editingTask={editingTask} />
        </SectionCard>

        <SectionCard
          title="Danh sách hạng mục"
          description="Xem các hạng mục hiện có theo từng mã dự án."
        >
          <ProjectTasksTable tasks={taskRows} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
