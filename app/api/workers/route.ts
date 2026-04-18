import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createMutationClient } from '@/lib/supabase/admin';

const workerSchema = z.object({
  worker_code: z.string().min(1, 'Mã công nhân là bắt buộc'),
  full_name: z.string().min(1, 'Họ tên là bắt buộc'),
  team_name: z.string().optional(),
  
 
  overtime_multiplier: z.number().min(1, 'Hệ số tăng ca phải >= 1'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = workerSchema.parse(body);
    const supabase = await createMutationClient();

    const { data, error } = await supabase
      .from('workers')
      .insert({
        worker_code: parsed.worker_code,
        full_name: parsed.full_name,
        team_name: parsed.team_name || null,
        
        
        overtime_multiplier: parsed.overtime_multiplier,
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
      .from('workers')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Không xóa được công nhân.' },
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
