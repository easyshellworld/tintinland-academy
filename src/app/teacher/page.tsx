// ./src/app/admin/page.tsx
'use client';

import { AdminProvider, useAdmin } from "@/components/AdminContext";
import { AdminHeader } from "@/components/teacher/TeacherHeader";
import { AnnouncementManagement } from "@/components/teacher/AnnouncementManagement"
import { AnswerCardManagement } from "@/components/teacher/AnswerCardManagement";

/* 
import { ResourceManagement } from "@/components/admin/ResourceManagement";
import { AnswerCardManagement } from "@/components/admin/AnswerCardManagement";
import { GradeManagement } from "@/components/admin/GradeManagement";
import { CertificateGeneration } from "@/components/admin/CertificateGeneration"; */

// 主内容区域组件
function AdminContent() {
  const { activeView } = useAdmin();

  // 根据当前视图渲染相应的组件
  const renderContent = () => {
    switch (activeView) {
      case "announcements":
        return <AnnouncementManagement />;
      case "answers":
        return <AnswerCardManagement />;
/*       case "grades":
        return <GradeManagement />;
      case "certificates":
        return <CertificateGeneration />;   */
      default:
        return <div>请选择一个管理功能</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader title="Oneblock Academy 管理系统" />
      <main className="flex-1 container py-6">
        {renderContent()}
      </main>
    </div>
  );
}

// 页面组件，包含 Context Provider
export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
}