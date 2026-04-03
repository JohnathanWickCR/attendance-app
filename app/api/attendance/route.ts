import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const attendanceSchema = z.object({
  work_date: z.string().min(1, 'Ngày làm là bắt buộc'),
  project_id: z.string().uuid('project_id không hợp lệ'),
  task_id: z.string().uuid('task_id không hợp lệ'),
  worker_count: z.number().min(0, 'Số công nhân phải >= 0'),
  overtime_worker_count: z.number().min(0, 'Số công nhân tăng ca phải >= 0'),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = attendanceSchema.parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('attendance_entries')
      .insert({
        work_date: parsed.work_date,
        worker_id: null,
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
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('attendance_entries')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
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
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('attendance_entries')
      .update({
        work_date: parsed.work_date,
        worker_id: null,
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
