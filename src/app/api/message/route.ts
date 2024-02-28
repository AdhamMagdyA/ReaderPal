import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";
import { pinecone } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { preparePrompt } from "@/lib/promptMaker";
import { openai } from "@/lib/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const POST = async (req: NextRequest) => {
  const body = req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: userId } = user;

  const { message, fileId } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  await db.message.create({
    data: {
      text: message,
      fileId,
      userId,
      isUserMessage: true,
    },
  });

  // vectorize the message
  let embeddings;
  if (process.env.OPENAI_API_KEY) {
    embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  } else if (process.env.MISTRAL_API_KEY) {
    embeddings = new MistralAIEmbeddings({
      apiKey: process.env.MISTRAL_API_KEY,
    });
  } else {
    embeddings = new HuggingFaceInferenceEmbeddings({
      maxRetries: 3,
      onFailedAttempt: (error) => {
        console.log(
          `Failed to embed page ${error.attemptNumber} times. Retrying...`
        );
      },
    });
  }

  const pineconeIndex = pinecone.Index("reader-pal");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const result = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((message) => {
    return {
      role: message.isUserMessage ? "user" : "assistant",
      content: message.text,
    };
  });

  const promptMessages = preparePrompt(formattedPrevMessages, result, message);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: promptMessages,
  });

  const stream = OpenAIStream(response, {
    async onCompletion(complete) {
      await db.message.create({
        data: {
          text: complete,
          fileId,
          userId,
          isUserMessage: false,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};
