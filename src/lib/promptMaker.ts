import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

interface Message {
  role: string;
  content: string;
}

interface Result {
  pageContent: string;
}

export const preparePrompt = (
  formattedPrevMessages: Message[],
  results: Result[],
  message: string
): ChatCompletionMessageParam[] => {
  return [
    {
      role: "system",
      content:
        "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
    },
    {
      role: "user",
      content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
              
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
          if (message.role === "user") return `User: ${message.content}\n`;
          return `Assistant: ${message.content}\n`;
        })}
        
        \n----------------\n
        
        CONTEXT:
        ${results.map((r) => r.pageContent).join("\n\n")}
        
        USER INPUT: ${message}`,
    },
  ];
};
