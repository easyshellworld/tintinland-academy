'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Register() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: 'UTC+8', // Default timezone value
    bio: '',
  });

  const [loading, setLoading] = useState(false); // 添加 loading 状态
  const [error, setError] = useState(''); // 添加 error 状态

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    if (!address || !formData.name || !formData.email) return;

    setLoading(true); // 开始加载
    setError(''); // 清除错误信息

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, address }),
      });

      if (response.ok) {
        router.push('/register/pending'); // 注册成功后跳转
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false); // 结束加载
    }
  };

  const handleLogout = () => {
    disconnect(); // 断开钱包连接
    router.push('/'); // 跳转到首页
  };

  if (!isConnected) return <p>请连接钱包</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">报名信息</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>} {/* 显示错误信息 */}

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          昵称 <span className="text-xs text-gray-500">(推荐使用英文格式)</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="请输入您的昵称"
          className="w-full border p-2 rounded"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          联系方式（推荐使用tg）
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="请输入您的邮箱地址"
          className="w-full border p-2 rounded"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="timezone" className="block text-sm font-medium mb-1">
          时区 <span className="text-xs text-gray-500">(默认 UTC+8)</span>
        </label>
        <input
          id="timezone"
          type="text"
          name="timezone"
          placeholder="例如: UTC+8"
          className="w-full border p-2 rounded"
          value={formData.timezone}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="bio" className="block text-sm font-medium mb-1">
          自我介绍
        </label>
        <textarea
          id="bio"
          name="bio"
          placeholder="请简单介绍一下您自己"
          className="w-full border p-2 rounded"
          value={formData.bio}
          onChange={handleInputChange}
        />
      </div>

      <Button onClick={handleRegister} className="w-full" disabled={loading}>
        {loading ? '提交中...' : '提交报名'}
      </Button>

      <Button onClick={handleLogout} className="w-full mt-4 bg-red-500 hover:bg-red-600">
        退出钱包并返回首页
      </Button>
    </div>
  );
}
