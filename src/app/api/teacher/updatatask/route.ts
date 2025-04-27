// ./src/app/api/teacher/updateTask/route.ts
import { NextResponse } from 'next/server';
import { updateTask } from '@/lib/db/query/tasks';

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, task1_practice_score, task2_practice_score, task3_practice_score, task4_practice_score, task5_practice_score, task6_practice_score } = data;

    // 校验必填字段
    if (typeof id !== 'number' || (task1_practice_score === undefined && task2_practice_score === undefined && task3_practice_score === undefined && task4_practice_score === undefined && task5_practice_score === undefined && task6_practice_score === undefined)) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const updatedFields = {
      task1_practice_score,
      task2_practice_score,
      task3_practice_score,
      task4_practice_score,
      task5_practice_score,
      task6_practice_score,
    };

    const result = updateTask(id, updatedFields);

    if (result.success) {
      return NextResponse.json({ message: 'Task updated successfully' });
    } else {
      return NextResponse.json({ message: 'Failed to update task', error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 });
  }
}
