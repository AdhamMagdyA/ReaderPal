import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      if (!user || !user.id) {
        throw new UploadThingError("You must be logged in to upload files");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata;
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          // the file url might be broken and to fix it use this line of code instead
          // url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          url: file.url,
          userId,
          status: "PROCESSING",
        },
      });
      try {
        const response = await fetch(createdFile.url);
        const blob = await response.blob();
        const loader = new PDFLoader(blob);

        const pageLevelDocs = await loader.load();
        const pagesAmt = pageLevelDocs.length;

        const pineconeIndex = pinecone.Index("reader-pal");

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
        console.log("Embeddings: ", embeddings);
        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });
        console.log("Indexed successfully");
        // file is uploaded and indexed successfully
        await db.file.update({
          where: { id: createdFile.id },
          data: {
            status: "SUCCESS",
          },
        });
      } catch (e) {
        // failed to index the file
        console.log("an error occured while indexing the file: ", e);

        await db.file.update({
          where: { id: createdFile.id },
          data: {
            status: "FAILED",
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
