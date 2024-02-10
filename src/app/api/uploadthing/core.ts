import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

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
      if (!createdFile) {
        throw new UploadThingError("Failed to create file");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
