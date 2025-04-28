'use client';
import React, { useEffect, useState } from 'react';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PersonalNote {
  id?: number;
  title: string;
  content_markdown: string;
  created_at?: string;
  updated_at?: string;
}

export function PersonalNotes() {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<PersonalNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');

  async function fetchNotes() {
    try {
      const res = await fetch('/api/student/notes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        console.error('Invalid notes response', data);
        toast.error('获取笔记失败');
      }
    } catch (err) {
      console.error('Failed to fetch notes', err);
      toast.error('获取笔记失败');
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleAddNote() {
    if (!title.trim() || !contentMarkdown.trim()) {
      toast.error('标题和内容不能为空');
      return;
    }
    try {
      const res = await fetch('/api/student/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'add',
          data: { title, content_markdown: contentMarkdown }
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('笔记创建成功');
        setTitle('');
        setContentMarkdown('');
        fetchNotes();
      } else {
        toast.error(result.message || '创建笔记失败');
      }
    } catch (err) {
      console.error('Failed to add note', err);
      toast.error('创建笔记失败');
    }
  }

  async function handleUpdateNote() {
    if (!selectedNote) return;
    try {
      const res = await fetch('/api/student/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: {
            id: selectedNote.id,
            title,
            content_markdown: contentMarkdown
          }
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('笔记更新成功');
        setIsEditing(false);
        setSelectedNote(null);
        setTitle('');
        setContentMarkdown('');
        fetchNotes();
      } else {
        toast.error(result.message || '更新笔记失败');
      }
    } catch (err) {
      console.error('Failed to update note', err);
      toast.error('更新笔记失败');
    }
  }

  async function handleDeleteNote(note: PersonalNote) {
    if (!confirm(`确定要删除 "${note.title}" 吗？`)) return;
    try {
      const res = await fetch('/api/student/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          data: { id: note.id }
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('笔记删除成功');
        fetchNotes();
      } else {
        toast.error(result.message || '删除笔记失败');
      }
    } catch (err) {
      console.error('Failed to delete note', err);
      toast.error('删除笔记失败');
    }
  }

  function handleEditNote(note: PersonalNote) {
    setSelectedNote(note);
    setTitle(note.title);
    setContentMarkdown(note.content_markdown);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setSelectedNote(null);
    setTitle('');
    setContentMarkdown('');
    setIsEditing(false);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full p-4">
      {/* Editor Panel */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">我的笔记</h2>
        <Input
          placeholder="笔记标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="h-96">
          <MarkdownEditor 
            value={contentMarkdown} 
            onChange={setContentMarkdown} 
          />
        </div>
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <Button onClick={handleUpdateNote}>保存修改</Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                取消
              </Button>
            </>
          ) : (
            <Button onClick={handleAddNote}>新增笔记</Button>
          )}
        </div>
      </div>

      {/* Notes List Panel */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">笔记列表</h2>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="flex flex-col gap-4 pr-4">
            {notes.map((note) => (
              <div key={note.id} className="border p-4 rounded hover:shadow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{note.title}</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEditNote(note)}
                    >
                      编辑
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteNote(note)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
                <div className="max-h-40 overflow-hidden">
                  <MarkdownViewer markdown={note.content_markdown} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
