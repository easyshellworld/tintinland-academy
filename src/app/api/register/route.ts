// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { addRegistration, Registration } from '@/lib/db/query/registrations';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
    
      name,
      wechatId,
      phone,
      email,
      gender,
      ageGroup,
      education,
      university,
      major,
      city,
      status,
      languages,
      experience,
      source,
      participated,
      dailyTime,
      interests,
      platforms,
      hackathon,
      leadership,
      privateMsg,
      inviter,
      address,
      studentId,
    } = data;

    // 校验必填字段
    if (!address || !name || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 构造注册对象
    const reg: Registration = {

      student_name: name,
      wechat_id: wechatId,
      phone,
      email,
      gender,
      age_group: ageGroup,
      education,
      university,
      major,
      city,
      role: Array.isArray(status) ? status.join(',') : status,
      languages: Array.isArray(languages) ? languages.join(',') : languages,
      experience,
      source,
      has_web3_experience: participated === '是',
      study_time: dailyTime,
      interests,
      platforms,
      willing_to_hackathon: hackathon === '愿意',
      willing_to_lead: leadership === '是',
      wants_private_service: privateMsg === '是',
      referrer: inviter,
      wallet_address: address,
      student_id: studentId,
      approved: false,
    };

    // 写入数据库
    addRegistration(reg);

    return NextResponse.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ message: 'Registration failed' }, { status: 500 });
  }
}
