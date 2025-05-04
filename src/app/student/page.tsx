'use client';

import { useState } from 'react';
import { StudentHeader } from '@/components/student/StudentHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnnouncementViewer } from '@/components/student/AnnouncementViewer';
import { PersonalNotes } from '@/components/student/PersonalNotes';
import { AnswerCard } from '@/components/student/AnswerCard';
import { GradeViewer } from '@/components/student/GradeViewer';
import { StudentClaimComponent } from '@/components/student/Claim';

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState('announcements');

  const renderContent = () => {
    switch (activeTab) {
      case 'announcements':
        return <AnnouncementViewer />;
      case 'notes':
        return <PersonalNotes />;
      case 'answers':
        return <AnswerCard />;
      case 'grades':
        return <GradeViewer />;
      case 'Claim':
        return <StudentClaimComponent />;
      default:
        return <AnnouncementViewer />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-1 container py-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="announcements">
              公告与资源
            </TabsTrigger>
            <TabsTrigger value="notes">
              学习笔记
            </TabsTrigger>
            <TabsTrigger value="answers">
              答题卡
            </TabsTrigger>
            <TabsTrigger value="grades">
              我的成绩
            </TabsTrigger>
            <TabsTrigger value="Claim">
            Claim
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {renderContent()}
      </main>
    </div>
  );
}
