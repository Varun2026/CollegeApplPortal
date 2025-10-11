import { OpenAIClient } from "@azure/openai";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

export async function summarizePdfText(pdfText: string) {
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID!;
  const prompt = `Summarize the following PDF content in 2-3 sentences for an admin preview:\n${pdfText}`;
  const result = await client.getCompletions(deploymentId, prompt, { maxTokens: 200 });
  return result.choices[0]?.text?.trim() || "No summary returned.";
}
