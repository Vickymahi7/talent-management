import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

enum AnswerType {
  TEXT = "text",
  UNORDERD_LIST = "unorderdList",
  JSON_ARRAY = "jsonArray",
}

export async function getOpenAiAnswer(
  profileTitle: string,
  topic: string,
  characterLength: number,
  answerType: string
): Promise<string | null> {
  // const role = "Frontend Vue js Developer"
  let content = null as string | null;
  const question = `
  Within ${characterLength} characters, give me ${topic} 
  section of a ${profileTitle} resume ${getAnswerTypeString(answerType)} as <content>.
  `;
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: question }],
      model: "gpt-3.5-turbo",
    });
    console.log(completion.choices[0]);
    content = completion.choices[0].message.content;
  } catch (error) {
    throw error;
  }
  return content;
}

function getAnswerTypeString(answerType: string): string {
  let result = "";

  if (answerType == "text") result = "";
  else if (answerType == "unorderdList") result = "as html unordered list";
  else if (answerType == "jsonArray") result = "items as Json Array";

  return result;
}

// main();
