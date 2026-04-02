import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const projectSchema = z.object({
  project_code: z.string().min(1, 'Mã dự án là bắt buộc'),
  project_name: z.string().min(1, 'Tên dự án là bắt buộc'),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = projectSchema.parse(body);
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