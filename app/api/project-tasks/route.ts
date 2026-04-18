import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createMutationClient } from '@/lib/supabase/admin';

const taskSchema = z.object({
  project_id: z.string().uuid('project_id không hợp lệ'),
  task_name: z.string().min(1, 'Tên hạng mục là bắt buộc'),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = taskSchema.parse(body);
    const supabase = await createMutationClient();

    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: parsed.project_id,
        task_name: parsed.task_name,
        description: parsed.description || null,
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = taskSchema
      .extend({
        id: z.string().uuid('id không hợp lệ'),
      })
      .parse(body);
    const supabase = await createMutationClient();

    const { data, error } = await supabase
      .from('project_tasks')
      .update({
        project_id: parsed.project_id,
        task_name: parsed.task_name,
        description: parsed.description || null,
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
      .from('project_tasks')
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
            'Không xóa được hạng mục. Kiểm tra DELETE policy của Supabase hoặc cấu hình SUPABASE_SERVICE_ROLE_KEY trên server.',
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
