import { NextResponse } from "next/server"
import { getStudyTopics } from "@/app/actions/study"

export async function GET() {
  const data = await getStudyTopics()
  return NextResponse.json(data)
}
