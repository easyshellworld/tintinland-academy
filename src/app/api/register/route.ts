import { NextResponse } from 'next/server';
import {  AuthFile, addAuth } from '@/lib/github'; 

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { address, name, email, timezone, bio } = data;

    if (!address || !name || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const registerData = {
      address,
      name,
      email,
      timezone,
      bio,
      approvalStatus: 'pending', // 默认状态为 pending
    };

    const registerFilePath = 'data/register.json'; // 注册信息存储路径

    // 读取现有的注册信息
    const existingRegisters = await  AuthFile(registerFilePath);
    const registers = existingRegisters ? JSON.parse(existingRegisters) : [];

    // 添加新的注册信息
        
    registers[registerData.address] = registerData

    // 将更新后的注册信息写入文件
    await addAuth(registerFilePath, JSON.stringify(registers, null, 2), `Add register for ${address}`);

    return NextResponse.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ message: 'Registration failed' }, { status: 500 });
  }
}