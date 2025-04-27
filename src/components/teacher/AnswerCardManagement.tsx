'use client';

import { useState, useEffect } from 'react';
import { ChoiceQuestion } from '@/lib/db/query/choiceQuestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export  function AnswerCardManagement() {
  const [taskNumber, setTaskNumber] = useState<number>(1);
  const [questions, setQuestions] = useState<ChoiceQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState<Partial<ChoiceQuestion>>({
    task_number: 1,
    question_text: '',
    options: {},
    correct_option: '',
    score: 1,
  });
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ChoiceQuestion>>({});
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchQuestions();
  }, [taskNumber]);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/choice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get' }),
      });
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data as ChoiceQuestion[]);
      } else {
        console.error('获取题目失败:', json.error);
      }
    } catch (error) {
      console.error('获取题目异常:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetNewQuestion() {
    setNewQuestion({
      task_number: taskNumber,
      question_text: '',
      options: {},
      correct_option: '',
      score: 1,
    });
  }

  async function handleAddQuestion() {
    if (!newQuestion.question_text || !newQuestion.options || !newQuestion.correct_option) {
      alert('请填写完整题目信息');
      return;
    }

    const payloadQuestion: ChoiceQuestion = {
      task_number: taskNumber,
      question_number: getNextQuestionNumber(),
      question_text: newQuestion.question_text,
      options: newQuestion.options,
      correct_option: newQuestion.correct_option,
      score: newQuestion.score ?? 1,
    };

    setLoading(true);
    try {
      const res = await fetch('/api/teacher/choice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', questions: [payloadQuestion] }),
      });
      const json = await res.json();
      if (json.success) {
        resetNewQuestion();
        fetchQuestions();
      } else {
        alert('添加失败:' + json.error);
      }
    } catch (error) {
      console.error('添加题目异常:', error);
    } finally {
      setLoading(false);
    }
  }

  function getNextQuestionNumber(): number {
    return questions.filter(q => q.task_number === taskNumber).length + 1;
  }

  function startEdit(question: ChoiceQuestion) {
    setEditingQuestionId(question.id!);
    setEditData({
      question_text: question.question_text,
      options: question.options,
      correct_option: question.correct_option,
      score: question.score,
    });
  }

  async function handleSaveEdit() {
    if (editingQuestionId == null) return;
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/choice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: editingQuestionId, updates: editData }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingQuestionId(null);
        fetchQuestions();
      } else {
        alert('更新失败:' + json.error);
      }
    } catch (error) {
      console.error('更新异常:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这道题？')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/choice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchQuestions();
      } else {
        alert('删除失败:' + json.error);
      }
    } catch (error) {
      console.error('删除异常:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>加载中...</p>;
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">答题卡管理</h2>

      <div className="flex gap-4">
        <Input
          type="number"
          value={taskNumber}
          onChange={(e) => setTaskNumber(Number(e.target.value))}
          placeholder="任务号"
          className="w-32"
        />
        <Button onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? '切换到编辑模式' : '切换到预览模式'}
        </Button>
      </div>

      {!previewMode && (
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">添加新题目</h3>
          <Input
            value={newQuestion.question_text ?? ''}
            onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
            placeholder="题目内容"
            className="mb-2"
          />
          <Textarea
            value={newQuestion.options ? JSON.stringify(newQuestion.options, null, 2) : ''}
            onChange={(e) => {
              try {
                setNewQuestion({ ...newQuestion, options: JSON.parse(e.target.value) });
              } catch {
                // ignore
              }
            }}
            placeholder='选项，格式：{"A":"选项A","B":"选项B"}'
            className="mb-2"
          />
          <Input
            value={newQuestion.correct_option ?? ''}
            onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: e.target.value })}
            placeholder="正确答案（A/B/C/D）"
            className="mb-2"
          />
          <Input
            type="number"
            value={newQuestion.score ?? 1}
            onChange={(e) => setNewQuestion({ ...newQuestion, score: Number(e.target.value) })}
            placeholder="分值"
            className="mb-2"
          />
          <Button onClick={handleAddQuestion}>添加题目</Button>
        </div>
      )}

      <div className="space-y-4">
        {questions
          .filter((q) => q.task_number === taskNumber)
          .sort((a, b) => a.question_number - b.question_number)
          .map((question) => (
            <div key={question.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">第 {question.question_number} 题</h4>
                <div className="flex gap-2">
                  {previewMode ? null : (
                    <>
                      <Button size="sm" onClick={() => startEdit(question)}>编辑</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(question.id!)}>删除</Button>
                    </>
                  )}
                </div>
              </div>

              {previewMode || editingQuestionId !== question.id ? (
                <>  
                  <p className="mb-2">{question.question_text}</p>
                  <ul className="list-disc ml-5 mb-2">
                    {Object.entries(question.options).map(([key, val]) => (
                      <li key={key}>{key}. {val}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={editData.question_text ?? ''}
                    onChange={(e) => setEditData({ ...editData, question_text: e.target.value })}
                    placeholder="题目内容"
                  />
                  <Textarea
                    value={editData.options ? JSON.stringify(editData.options, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        setEditData({ ...editData, options: JSON.parse(e.target.value) });
                      } catch {}
                    }}
                    placeholder='选项，格式：{"A":"选项A","B":"选项B"}'
                  />
                  <Input
                    value={editData.correct_option ?? ''}
                    onChange={(e) => setEditData({ ...editData, correct_option: e.target.value })}
                    placeholder="正确答案"
                  />
                  <Input
                    type="number"
                    value={editData.score ?? 1}
                    onChange={(e) => setEditData({ ...editData, score: Number(e.target.value) })}
                    placeholder="分值"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>保存</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingQuestionId(null)}>取消</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
