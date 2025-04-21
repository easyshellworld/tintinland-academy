import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const token = await auth(req);
  const pathname = req.nextUrl.pathname;

  // 保护 /dashboard 路由
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // 如果没有 token，则重定向到主页
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    // 如果有 token，继续执行请求，并传递 token
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('Authorization', `Bearer ${token.accessToken}`);
    return NextResponse.next({ headers: requestHeaders });
  }

  // 保护 /api/file 和 /api/save 路由
  if (pathname.startsWith('/api/file') || pathname.startsWith('/api/save')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 如果有 token，继续执行请求，并传递 token
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('Authorization', `Bearer ${token.accessToken}`);
    return NextResponse.next({ headers: requestHeaders });
  }

  // 其他路由，允许访问
  return NextResponse.next();
}

// 只保护特定路由
export const config = {
  matcher: ['/dashboard/:path*', '/api/file', '/api/save'],
};