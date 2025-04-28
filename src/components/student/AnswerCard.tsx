'use client';

import { useState, useEffect } from 'react';
import { ChoiceQuestion } from '@/lib/db/query/choiceQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Answer {
  question_id: number;
  selected_option: string;
}

export function AnswerCard() {
  const [taskNumber, setTaskNumber] = useState<number>(1);
  const [questions, setQuestions] = useState<ChoiceQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<ChoiceQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [availableTasks, setAvailableTasks] = useState<number[]>([1]);

  // Load questions and answers
  useEffect(() => {
    fetchQuestions();
    fetchAnswers();
  }, []);

  // Filter questions by task
  useEffect(() => {
    filterQuestionsByTask();
  }, [taskNumber, questions]);

  // Update available tasks
  useEffect(() => {
    updateAvailableTasks();
  }, [questions]);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await fetch('/api/student/choice-questions');
      const json = await res.json();
      
      if (json.success) {
        setQuestions(json.data);
        filterQuestionsByTask();
        updateAvailableTasks();
      } else {
        toast.error("获取题目失败", {
          description: json.error || "未知错误"
        });
      }
    } catch (error) {
      toast.error("获取题目异常", {
        description: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnswers() {
    try {
      const res = await fetch('/api/student/task');
      const json = await res.json();
      
      if (json.success && Array.isArray(json.data)) {
        const answerMap: Record<number, string> = {};
        json.data.forEach((answer: Answer) => {
          answerMap[answer.question_id] = answer.selected_option;
        });
        setAnswers(answerMap);
      }
    } catch (error) {
      console.error("获取答案异常:", error);
    }
  }

  function updateAvailableTasks() {
    if (questions.length === 0) {
      setAvailableTasks([1]);
      return;
    }
    
    const taskNumbers = Array.from(new Set(questions.map(q => q.task_number))).sort((a, b) => a - b);
    setAvailableTasks(taskNumbers);
    
    if (!taskNumbers.includes(taskNumber)) {
      setTaskNumber(taskNumbers[0] || 1);
    }
  }

  function filterQuestionsByTask() {
    setFilteredQuestions(
      questions
        .filter(q => q.task_number === taskNumber)
        .sort((a, b) => a.question_number - b.question_number)
    );
  }

  function handleAnswerChange(questionId: number, option: string) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  }

  async function handleSubmitAnswers() {
    if (filteredQuestions.length === 0) return;

    const unanswered = filteredQuestions.filter(q => !answers[q.id!]);
    if (unanswered.length > 0) {
      toast.error("请完成所有题目", {
        description: `还有${unanswered.length}题未作答`
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = filteredQuestions.map(q => ({
        question_id: q.id!,
        selected_option: answers[q.id!] || '',
        task_number: taskNumber
      }));

      const res = await fetch('/api/student/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload }),
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success("提交成功", {
          description: "答题卡已成功提交"
        });
        fetchAnswers(); // Refresh answers
      } else {
        toast.error("提交失败", {
          description: json.error || "未知错误"
        });
      }
    } catch (error) {
      toast.error("提交异常", {
        description: (error as Error).message
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>答题卡</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium">当前任务:</span>
              <Select
                value={taskNumber.toString()}
                onValueChange={(value) => setTaskNumber(Number(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="选择任务" />
                </SelectTrigger>
                <SelectContent>
                  {availableTasks.map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      任务 {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>当前任务没有题目</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 py-3">
                    <CardTitle className="text-base">
                      第 {question.question_number} 题 ({question.score} 分)
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="py-4">
                    <div className="mb-3 font-medium">{question.question_text}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div 
                          key={key} 
                          className={`p-2 rounded-md cursor-pointer ${
                            answers[question.id!] === key 
                              ? 'bg-blue-100 dark:bg-blue-900/20' 
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                          onClick={() => handleAnswerChange(question.id!, key)}
                        >
                          <span className="font-medium mr-2">{key}.</span>
                          {value}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4">
                <Button 
                  onClick={handleSubmitAnswers}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  提交答案
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
