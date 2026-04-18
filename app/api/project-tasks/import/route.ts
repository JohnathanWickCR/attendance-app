import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createMutationClient } from '@/lib/supabase/admin';

const importRowSchema = z.object({
  project_code: z.string().min(1, 'Mã dự án là bắt buộc'),
  task_name: z.string().min(1, 'Tên hạng mục là bắt buộc'),
});

const importSchema = z.object({
  rows: z.array(importRowSchema).min(1, 'Không có dữ liệu để import'),
});

type ImportErrorItem = {
  rowNumber: number;
  reason: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = importSchema.parse(body);
    const supabase = await createMutationClient();

    const normalizedRows = parsed.rows.map((row, index) => ({
      rowNumber: index + 2,
      project_code: row.project_code.trim(),
      task_name: row.task_name.trim(),
    }));

    const uniqueProjectCodes = Array.from(
      new Set(normalizedRows.map((row) => row.project_code))
    );

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_code')
      .in('project_code', uniqueProjectCodes);

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 400 });
    }

    const projectMap = new Map(
      (projects ?? []).map((project) => [project.project_code.trim(), project.id])
    );

    const validRows: Array<{
      rowNumber: number;
      project_id: string;
      task_name: string;
    }> = [];
    const errors: ImportErrorItem[] = [];
    const seenRowsInFile = new Set<string>();

    for (const row of normalizedRows) {
      const projectId = projectMap.get(row.project_code);

      if (!projectId) {
        errors.push({
          rowNumber: row.rowNumber,
          reason: `Không tìm thấy mã dự án "${row.project_code}"`,
        });
        continue;
      }

      const key = `${projectId}::${row.task_name.toLocaleLowerCase('vi')}`;

      if (seenRowsInFile.has(key)) {
        errors.push({
          rowNumber: row.rowNumber,
          reason: `Trùng hạng mục "${row.task_name}" trong cùng file import`,
        });
        continue;
      }

      seenRowsInFile.add(key);
      validRows.push({
        rowNumber: row.rowNumber,
        project_id: projectId,
        task_name: row.task_name,
      });
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          createdCount: 0,
          skippedCount: errors.length,
          errors,
        },
        { status: 400 }
      );
    }

    const projectIds = Array.from(new Set(validRows.map((row) => row.project_id)));
    const { data: existingTasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('project_id, task_name')
      .in('project_id', projectIds);

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 400 });
    }

    const existingTaskSet = new Set(
      (existingTasks ?? []).map(
        (task) => `${task.project_id}::${task.task_name.trim().toLocaleLowerCase('vi')}`
      )
    );

    const rowsToInsert = validRows.filter((row) => {
      const key = `${row.project_id}::${row.task_name.toLocaleLowerCase('vi')}`;

      if (existingTaskSet.has(key)) {
        errors.push({
          rowNumber: row.rowNumber,
          reason: `Hạng mục "${row.task_name}" đã tồn tại cho mã dự án này`,
        });
        return false;
      }

      return true;
    });

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('project_tasks').insert(
        rowsToInsert.map((row) => ({
          project_id: row.project_id,
          task_name: row.task_name,
          description: null,
        }))
      );

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      createdCount: rowsToInsert.length,
      skippedCount: errors.length,
      errors,
    });
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
