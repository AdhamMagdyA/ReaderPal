import { OpenAI } from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_CHAT_API_KEY,
});
