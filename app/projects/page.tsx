import ProjectForm from '@/components/projects/project-form';
import ProjectsTable from '@/components/projects/projects-table';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';

export default function ProjectsPage() {
  return (
    <PageContainer
      title="Dự án"
      description="Quản lý danh sách dự án và thông tin liên quan."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Thêm dự án"
          description="Tạo mới và cập nhật thông tin dự án."
          className="h-fit"
        >
          <ProjectForm />
        </SectionCard>

        <SectionCard
          title="Danh sách dự án"
          description="Xem và quản lý các dự án hiện có."
        >
          <ProjectsTable />
        </SectionCard>
      </div>
    </PageContainer>
  );
}