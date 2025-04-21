'use client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LearningProvider } from "@/components/LearningContext";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <LearningProvider>
    <div className="flex flex-col h-screen">
      <Header  />
      <main className="flex-grow overflow-auto">
        {children}
      </main>
      <Footer />
    </div>
    </LearningProvider>
  );
}

export default Layout;