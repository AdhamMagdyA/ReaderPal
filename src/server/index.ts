import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { router, publicProcedure, authProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    if (!user.id || !user.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    // check if the user in the database
    const dbUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.given_name,
          picture: user.picture,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: authProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    try {
      const files = await db.file.findMany({
        where: {
          userId,
        },
      });
      if (!files) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No files found",
        });
      }
      return files;
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
      });
    }
  }),
  getFileStatus: authProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findUnique({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.status };
    }),
  deleteFile: authProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { userId } = ctx;

      const file = await db.file.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const deletedFile = await db.file.delete({
        where: {
          id,
        },
      });

      return deletedFile;
    }),
  getFile: authProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { key } = input;
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
