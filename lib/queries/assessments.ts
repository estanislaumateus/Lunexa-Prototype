import { Assessment, query } from "../database"

export async function getAssessments(): Promise<Assessment[]> {
  const results = await query("SELECT * FROM assessments")
  return results as unknown as Assessment[]
}
