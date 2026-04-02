import WorkerForm from '@/components/workers/worker-form';
import WorkersTable from '@/components/workers/workers-table';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';

export default function Page() {
  return (
    <PageContainer
      title="Công nhân"
      description="Quản lý danh sách công nhân và thông tin liên quan."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Thêm công nhân"
          description="Tạo mới và cập nhật thông tin công nhân."
          className="h-fit"
        >
          <WorkerForm />
        </SectionCard>

        <SectionCard
          title="Danh sách công nhân"
          description="Xem và quản lý các công nhân hiện có."
        >
          <WorkersTable />
        </SectionCard>
      </div>
    </PageContainer>
  );
}