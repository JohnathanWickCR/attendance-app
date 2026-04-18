import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const projectSchema = z.object({
  project_code: z.string().min(1, 'Mã dự án là bắt buộc'),
  project_name: z.string().min(1, 'Tên dự án là bắt buộc'),
  description: z.string().optional(),
});

async function ensureUniqueProjectName(
  projectName: string,
  excludeId?: string
) {
  const supabase = await createClient();
  let query = supabase
    .from('projects')
    .select('id')
    .eq('project_name', projectName)
    .limit(1);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    throw new Error('Tên dự án đã tồn tại');
  }
}

function toProjectErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Lỗi hệ thống';
  }

  if (error.message.includes('projects_project_code_key')) {
    return 'Database hiện vẫn đang khóa trùng mã dự án. Cần bỏ unique constraint của project_code trong Supabase.';
  }

  return error.message;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = projectSchema.parse(body);
    await ensureUniqueProjectName(parsed.project_name);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .insert({
        project_code: parsed.project_code,
        project_name: parsed.project_name,
        description: parsed.description || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: toProjectErrorMessage(new Error(error.message)) },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: toProjectErrorMessage(error) },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = projectSchema
      .extend({
        id: z.string().uuid('id không hợp lệ'),
      })
      .parse(body);
    await ensureUniqueProjectName(parsed.project_name, parsed.id);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .update({
        project_code: parsed.project_code,
        project_name: parsed.project_name,
        description: parsed.description || null,
      })
      .eq('id', parsed.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: toProjectErrorMessage(new Error(error.message)) },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: toProjectErrorMessage(error) },
      { status: 400 }
    );
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

    const supabase = createAdminClient() ?? (await createClient());
    const { data, error } = await supabase
      .from('projects')
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
            'Không xóa được dự án. Kiểm tra DELETE policy của Supabase hoặc cấu hình SUPABASE_SERVICE_ROLE_KEY trên server.',
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
