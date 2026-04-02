import { createClient } from '@/lib/supabase/server';
import AttendanceForm from '@/components/attendance/attendance-form';
import AttendanceTable from '@/components/attendance/attendance-table';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';

type SearchParams = Promise<{ edit?: string }>;

export default async function AttendancePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const { data: workers, error: workersError } = await supabase
    .from('workers')
    .select('id, worker_code, full_name')
    .order('created_at', { ascending: false });

  if (workersError) throw new Error(workersError.message);

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, project_code, project_name')
    .order('created_at', { ascending: false });

  if (projectsError) throw new Error(projectsError.message);

  const { data: tasks, error: tasksError } = await supabase
    .from('project_tasks')
    .select('id, project_id, task_name')
    .order('created_at', { ascending: false });

  if (tasksError) throw new Error(tasksError.message);

  const { data: rows, error: rowsError } = await supabase
    .from('attendance_entries')
    .select(`
      id,
      work_date,
      regular_hours,
      overtime_hours,
      note,
      worker_id,
      project_id,
      task_id,
      workers (
        worker_code,
        full_name
      ),
      projects (
        project_code,
        project_name
      ),
      project_tasks (
        task_name
      )
    `)
    .order('created_at', { ascending: false });

  if (rowsError) throw new Error(rowsError.message);

  let editingAttendance = null;

  if (searchParams.edit) {
    const found = (rows || []).find((row) => row.id === searchParams.edit);
    if (found) {
      editingAttendance = {
        id: found.id,
        work_date: found.work_date,
        worker_id: found.worker_id,
        project_id: found.project_id,
        task_id: found.task_id,
        regular_hours: Number(found.regular_hours || 0),
        overtime_hours: Number(found.overtime_hours || 0),
        note: found.note || '',
      };
    }
  }

  return (
    <PageContainer
      title="Chấm công"
      description="Thêm, sửa, xóa dữ liệu chấm công và theo dõi danh sách bản ghi."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title={editingAttendance ? 'Sửa chấm công' : 'Thêm chấm công'}
          description="Nhập thông tin chấm công cho công nhân theo dự án và hạng mục."
          className="h-fit"
        >
          <AttendanceForm
            workers={workers || []}
            projects={projects || []}
            tasks={tasks || []}
            editingAttendance={editingAttendance}
            onCancelEdit={undefined as never}
          />
        </SectionCard>

        <SectionCard
          title="Danh sách chấm công"
          description="Xem, lọc và thao tác trên các bản ghi chấm công hiện có."
        >
          <AttendanceTable rows={(rows as any[]) || []} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}