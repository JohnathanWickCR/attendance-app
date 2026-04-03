import { createClient } from '@/lib/supabase/server';
import AttendanceForm, {
  type AttendanceProjectOption,
  type AttendanceTaskOption,
  type EditingAttendance,
} from '@/components/attendance/attendance-form';
import AttendanceTable, {
  type AttendanceRow,
} from '@/components/attendance/attendance-table';
import { PageContainer } from '@/components/ui/page-container';
import { SectionCard } from '@/components/ui/section-card';

type SearchParams = Promise<{ edit?: string }>;

export default async function AttendancePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

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
      project_id,
      task_id,
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

  const projectOptions: AttendanceProjectOption[] = (projects || []).map((project) => ({
    id: project.id,
    project_code: project.project_code,
    project_name: project.project_name,
  }));

  const taskOptions: AttendanceTaskOption[] = (tasks || []).map((task) => ({
    id: task.id,
    project_id: task.project_id,
    task_name: task.task_name,
  }));

  const attendanceRows: AttendanceRow[] = (rows || []).map((row) => {
    const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
    const task = Array.isArray(row.project_tasks) ? row.project_tasks[0] : row.project_tasks;

    return {
      id: row.id,
      work_date: row.work_date,
      worker_count: Number(row.regular_hours || 0),
      overtime_worker_count: Number(row.overtime_hours || 0),
      note: row.note,
      project_id: row.project_id,
      task_id: row.task_id,
      project_code: project?.project_code ?? '',
      project_name: project?.project_name ?? '',
      task_name: task?.task_name ?? '',
    };
  });

  let editingAttendance: EditingAttendance | null = null;

  if (searchParams.edit) {
    const found = attendanceRows.find((row) => row.id === searchParams.edit);
    if (found) {
      editingAttendance = {
        id: found.id,
        work_date: found.work_date,
        project_id: found.project_id,
        task_id: found.task_id,
        worker_count: found.worker_count,
        overtime_worker_count: found.overtime_worker_count,
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
          description="Nhập số công nhân làm việc theo mã dự án, khách hàng và hạng mục."
          className="h-fit"
        >
          <AttendanceForm
            projects={projectOptions}
            tasks={taskOptions}
            editingAttendance={editingAttendance}
          />
        </SectionCard>

        <SectionCard
          title="Danh sách chấm công"
          description="Xem, lọc và thao tác trên các bản ghi chấm công hiện có."
        >
          <AttendanceTable rows={attendanceRows} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
