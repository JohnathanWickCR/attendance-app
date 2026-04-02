import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const workerSchema = z.object({
  worker_code: z.string().min(1, 'Mã công nhân là bắt buộc'),
  full_name: z.string().min(1, 'Họ tên là bắt buộc'),
  team_name: z.string().optional(),
  skill_name: z.string().optional(),
  labor_rate_per_hour: z.number().min(0, 'Đơn giá phải >= 0'),
  overtime_multiplier: z.number().min(1, 'Hệ số tăng ca phải >= 1'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = workerSchema.parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('workers')
      .insert({
        worker_code: parsed.worker_code,
        full_name: parsed.full_name,
        team_name: parsed.team_name || null,
        skill_name: parsed.skill_name || null,
        labor_rate_per_hour: parsed.labor_rate_per_hour,
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