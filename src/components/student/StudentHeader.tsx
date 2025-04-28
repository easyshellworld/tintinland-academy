'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogOut } from "lucide-react";
import { useDisconnect } from 'wagmi';
import { signOut } from 'next-auth/react';
import { useRouter } from "next/navigation";

export function StudentHeader() {
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await disconnect();
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 bg-white border-b z-50">
      <div className="container flex justify-between items-center py-4">
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="OneBlock Academy Logo" 
            width={40} 
            height={40} 
          />
          <h1 className="ml-4 text-xl font-bold">
            OneBlock Academy - 学员平台
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
    </header>
  );
}
