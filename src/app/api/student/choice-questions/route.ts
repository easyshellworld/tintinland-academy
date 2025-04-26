import { NextRequest, NextResponse } from 'next/server';
import { 
  getQuestionsWithoutAnswers,
  calculateChoiceScore,
  getAllChoiceQuestions,
  ChoiceQuestion
} from '@/lib/db/query/choiceQuestions';
import { 
  getTaskByStudentId, 
  updateTask,
  Task
} from '@/lib/db/query/tasks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'get': {
        const questions = getQuestionsWithoutAnswers();
        return NextResponse.json({ success: true, data: questions });
      }

      case 'submit': {
        const { student_id, task_number, answers } = data;

        if (!student_id || !task_number || !answers || typeof answers !== 'object') {
          return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const existingTask = getTaskByStudentId(student_id) as Task | undefined;

        if (!existingTask || !existingTask.id) {
          return NextResponse.json(
            { success: false, error: 'Student record not found' },
            { status: 404 }
          );
        }

        const totalScore = calculateChoiceScore(answers);
        const allQuestions: ChoiceQuestion[] = getAllChoiceQuestions();
        const taskQuestions = allQuestions.filter((q) => q.task_number === task_number);

        const incorrectQuestions = taskQuestions
          .filter((question: ChoiceQuestion) => {
            const questionId = question.id;
            return (
              questionId !== undefined &&
              answers[questionId] !== undefined &&
              question.correct_option !== answers[questionId]
            );
          })
          .map((q: ChoiceQuestion) => {
            const questionId = q.id ?? 0;
            return {
              id: questionId,
              question_number: q.question_number,
              correct_option: q.correct_option,
              student_answer: answers[questionId]
            };
          });

        const scoreFieldName = `task${task_number}_choice_score` as keyof Task;
        const update = {
          [scoreFieldName]: totalScore
        };

        const updateResult = updateTask(existingTask.id, update);

        if (!updateResult.success) {
          return NextResponse.json(
            { success: false, error: 'Failed to update student score' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          total_score: totalScore,
          total_questions: taskQuestions.length,
          incorrect_questions: incorrectQuestions,
          message: `Score for Task ${task_number} has been updated`
        });
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
