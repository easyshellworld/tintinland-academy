'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Score {
  id: number;
  task_number: number;
  score_type: string;
  score: number;
  completed: boolean;
  created_at: string;
}

export function GradeViewer() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student's scores
  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/student/taskscores');
        if (!res.ok) throw new Error('获取成绩失败');
        const data = await res.json();
        setScores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
        toast.error('获取成绩失败');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  // Calculate summary stats
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const avgScore = scores.length > 0 ? (totalScore / scores.length).toFixed(2) : 0;
  const completedTasks = scores.filter(s => s.completed).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>我的成绩</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">总分数</h3>
              <p className="text-2xl font-bold">{totalScore}</p>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">平均分</h3>
              <p className="text-2xl font-bold">{avgScore}</p>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">完成任务</h3>
              <p className="text-2xl font-bold">
                {completedTasks}/{scores.length}
              </p>
            </div>
          </div>

          {/* Scores Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任务编号</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>分数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.length > 0 ? (
                  scores.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell>任务 {score.task_number}</TableCell>
                      <TableCell>
                        {score.score_type === 'practice' ? '实践题' : '选择题'}
                      </TableCell>
                      <TableCell>{score.score}</TableCell>
                      <TableCell>
                        {score.completed ? (
                          <span className="text-green-600">已完成</span>
                        ) : (
                          <span className="text-yellow-600">进行中</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(score.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      暂无成绩记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
