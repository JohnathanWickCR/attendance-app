import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createMutationClient } from '@/lib/supabase/admin';

const attendanceSchema = z.object({
  work_date: z.string().min(1, 'Ngày làm là bắt buộc'),
  project_id: z.string().uuid('project_id không hợp lệ'),
  task_id: z.string().uuid('task_id không hợp lệ'),
  worker_count: z.number().min(0, 'Số công nhân phải >= 0'),
  overtime_worker_count: z.number().min(0, 'Số công nhân tăng ca phải >= 0'),
  note: z.string().optional(),
});

async function resolveLegacyWorkerId() {
  const supabase = await createMutationClient();

  const { data: existingWorker, error: existingWorkerError } = await supabase
    .from('workers')
    .select('id')
    .eq('worker_code', 'AUTO_ATTENDANCE')
    .maybeSingle();

  if (existingWorkerError) {
    throw new Error(existingWorkerError.message);
  }

  if (existingWorker) {
    return existingWorker.id;
  }

  const { data: fallbackWorker, error: fallbackWorkerError } = await supabase
    .from('workers')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fallbackWorkerError) {
    throw new Error(fallbackWorkerError.message);
  }

  if (fallbackWorker) {
    return fallbackWorker.id;
  }

  const { data: createdWorker, error: createWorkerError } = await supabase
    .from('workers')
    .insert({
      worker_code: 'AUTO_ATTENDANCE',
      full_name: 'Tự động chấm công',
      team_name: 'Hệ thống',
      overtime_multiplier: 1,
    })
    .select('id')
    .single();

  if (createWorkerError) {
    throw new Error(createWorkerError.message);
  }

  return createdWorker.id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = attendanceSchema.parse(body);
    const supabase = await createMutationClient();
    const workerId = await resolveLegacyWorkerId();

    const { data, error } = await supabase
      .from('attendance_entries')
      .insert({
        work_date: parsed.work_date,
        worker_id: workerId,
        project_id: parsed.project_id,
        task_id: parsed.task_id,
        regular_hours: parsed.worker_count,
        overtime_hours: parsed.overtime_worker_count,
        note: parsed.note || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = z
      .object({
        id: z.string().uuid('id không hợp lệ'),
      })
      .parse(body);

    const supabase = await createMutationClient();

    const { data, error } = await supabase
      .from('attendance_entries')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            'Không xóa được chấm công. Kiểm tra DELETE policy của Supabase hoặc cấu hình SUPABASE_SERVICE_ROLE_KEY trên server.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const attendanceSchema = z.object({
      id: z.string().uuid('id không hợp lệ'),
      work_date: z.string().min(1, 'Ngày làm là bắt buộc'),
      project_id: z.string().uuid('project_id không hợp lệ'),
      task_id: z.string().uuid('task_id không hợp lệ'),
      worker_count: z.number().min(0, 'Số công nhân phải >= 0'),
      overtime_worker_count: z.number().min(0, 'Số công nhân tăng ca phải >= 0'),
      note: z.string().optional(),
    });

    const parsed = attendanceSchema.parse(body);
    const supabase = await createMutationClient();
    const workerId = await resolveLegacyWorkerId();

    const { data, error } = await supabase
      .from('attendance_entries')
      .update({
        work_date: parsed.work_date,
        worker_id: workerId,
        project_id: parsed.project_id,
        task_id: parsed.task_id,
        regular_hours: parsed.worker_count,
        overtime_hours: parsed.overtime_worker_count,
        note: parsed.note || null,
      })
      .eq('id', parsed.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
