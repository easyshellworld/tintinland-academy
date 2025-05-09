import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllChoiceQuestions, 
  addChoiceQuestion, 
  updateChoiceQuestion, 
  deleteChoiceQuestion,
  deleteChoiceQuestionsByTaskNumber,
  ChoiceQuestion
} from '@/lib/db/query/choiceQuestions';

// 设置为仅处理 POST 请求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'get': {
        const questions = await getAllChoiceQuestions();
        return NextResponse.json({ success: true, data: questions });
      }

      case 'add': {
        if (Array.isArray(data.questions)) {
          const results = await Promise.all(
            data.questions.map(async (question: ChoiceQuestion) => {
              return await addChoiceQuestion(question);
            })
          );
          return NextResponse.json({ 
            success: true, 
            message: `Successfully added ${results.length} questions` 
          });
        } else {
          await addChoiceQuestion(data.question);
          return NextResponse.json({ 
            success: true, 
            message: 'Successfully added question' 
          });
        }
      }

      case 'update': {
        if (!data.id) {
          return NextResponse.json(
            { success: false, error: 'Question ID is required' },
            { status: 400 }
          );
        }

        const updateResult = await updateChoiceQuestion(data.id, data.updates);
        if (updateResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: 'Successfully updated question',
            changes: updateResult.changes
          });
        } else {
          return NextResponse.json(
            { success: false, error: updateResult.error },
            { status: 400 }
          );
        }
      }

      case 'delete': {
        if (!data.id) {
          return NextResponse.json(
            { success: false, error: 'Question ID is required' },
            { status: 400 }
          );
        }
        
        const deleteResult = await deleteChoiceQuestion(Number(data.id));
        if (deleteResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: 'Successfully deleted question',
            changes: deleteResult.changes
          });
        } else {
          return NextResponse.json(
            { success: false, error: deleteResult.error },
            { status: 400 }
          );
        }
      }

      case 'deleteByTask': {
        if (typeof data.taskNumber !== "number") {
          return NextResponse.json(
            { success: false, error: 'Task number is required' },
            { status: 400 }
          );
        }

        const deleteByTaskResult = await deleteChoiceQuestionsByTaskNumber(Number(data.taskNumber));
        if (deleteByTaskResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: `Successfully deleted ${deleteByTaskResult.changes} questions for task ${data.taskNumber}`,
            changes: deleteByTaskResult.changes
          });
        } else {
          return NextResponse.json(
            { success: false, error: deleteByTaskResult.error },
            { status: 400 }
          );
        }
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
