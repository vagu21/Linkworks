import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { validateRequest } from "~/utils/session.server";
import OpenAI from "openai";

export const action: ActionFunction = async ({ request }) => {
  await validateRequest(request);
  const apiKey = process.env.OPENAI_API_KEY;

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const { prompt } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    const rawResponse = response.choices[0].message.content?.trim();
    const jsonMatch = rawResponse?.match(/```json\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1] : rawResponse;

    const result = JSON.parse(jsonString!);
    return json(result);
  } catch (error: any) {
    console.error("Error:", error);
    throw error.message;
  }
};
