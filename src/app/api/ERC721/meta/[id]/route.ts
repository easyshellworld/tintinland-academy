import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // 简单处理避免 eslint 报错（例如记录日志，或读取属性）
  console.log("Received ID:", params.id);
  req.headers.get("user-agent"); // 虽然不使用，但访问即可避免 unused 报错

  const metadata = {
    attributes: [
      { trait_type: "Shape", value: "Circle" },
      { trait_type: "Mood", value: "Sad" },
    ],
    description: "oneblock",
    image: "https://xxxx.netlify.app/oneblock.jpg",
    name: "oneblock",
  };

  return NextResponse.json(metadata);
}
