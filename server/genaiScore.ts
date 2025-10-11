import { OpenAIClient } from "@azure/ai-openai";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

export async function scoreApplicationQuality({ gpa, course, department }: { gpa: string, course: string, department: string }) {
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID!;
  const prompt = `A student is applying for the course '${course}' in the department '${department}' with a GPA of ${gpa}. Analyze the fit and quality of this application and provide a score (1-10) and a brief feedback.`;
  const result = await client.getCompletions(deploymentId, prompt, { maxTokens: 100 });
  return result.choices[0]?.text?.trim() || "No score returned.";
}
