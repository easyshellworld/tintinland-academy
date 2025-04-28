// src/app/api/student/taskscores/route.ts
import { NextResponse } from 'next/server'
import { getRawScores } from '@/lib/db/query/taskScores'

export async function GET() {
  const pivoted = getRawScores()
  return NextResponse.json(pivoted)
}
