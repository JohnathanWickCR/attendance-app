import { createClient } from '@/lib/supabase/server';
import ProjectForm, { type EditingProject } from '@/components/projects/project-form';
import ProjectsTable, { type ProjectRow } from '@/components/projects/projects-table';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';

type SearchParams = Promise<{ edit?: string }>;

export default async function ProjectsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('id, project_code, project_name, description')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const projects: ProjectRow[] = (data || []).map((project) => ({
    id: project.id,
    project_code: project.project_code,
    project_name: project.project_name,
    description: project.description,
  }));

  let editingProject: EditingProject | null = null;

  if (searchParams.edit) {
    const found = projects.find((project) => project.id === searchParams.edit);
    if (found) {
      editingProject = {
        id: found.id,
        project_code: found.project_code,
        project_name: found.project_name,
        description: found.description ?? '',
      };
    }
  }

  return (
    <PageContainer
      title="Dự án"
      description="Quản lý mã dự án, khách hàng và thông tin liên quan."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title={editingProject ? 'Sửa dự án' : 'Thêm dự án'}
          description="Tạo mới và cập nhật thông tin dự án."
          className="h-fit"
        >
          <ProjectForm editingProject={editingProject} />
        </SectionCard>

        <SectionCard
          title="Danh sách dự án"
          description="Xem và quản lý các dự án hiện có."
        >
          <ProjectsTable projects={projects} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
