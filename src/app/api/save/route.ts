import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';
import { AuthFile, updateFile } from '@/lib/github';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret });
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const address = request.nextUrl.searchParams.get('address');
    if (!address) {
      return NextResponse.json({ message: 'Address is required' }, { status: 400 });
    }

    const { content } = await request.json();

    const registerFilePath = 'data/register.json';
    const registerData = await AuthFile(registerFilePath);
    if (!registerData) {
      return NextResponse.json({ message: 'Register data not found' }, { status: 404 });
    }

    const registers = JSON.parse(registerData);
    const user = registers[address];
    if (!user || !user.file) {
      return NextResponse.json({ message: 'File not found for this address' }, { status: 404 });
    }

    const filePath = user.file;
    await updateFile(filePath, content, `Update file for ${registers[address].name}`);

    return NextResponse.json({ message: 'File saved successfully' });
  } catch (error) {
    console.error('Failed to save file:', error);
    return NextResponse.json({ message: 'Failed to save file' }, { status: 500 });
  }
}