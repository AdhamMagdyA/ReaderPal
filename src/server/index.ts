import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { router, publicProcedure, authProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INIFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
import { UTApi } from "uploadthing/server";
import { pinecone } from "@/lib/pinecone";

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
  createStripeSession: authProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const billingUrl = "https://readerpal.vercel.app/dashboard/billing";
    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });
      return { url: stripeSession.url };
    }
    console.log(
      `going to create a new session with billing url: ${billingUrl}`
    );
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return { url: stripeSession.url };
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

      try {
        // delete the file from the uploadthing storage
        const fileKey = file.key;
        const utapi = new UTApi();
        await utapi.deleteFiles([fileKey]);
        // delete the file from the pinecone index
        const index = pinecone.index("reader-pal");
        const fileId = file.id;
        await index.namespace(fileId).deleteAll();
        // delete the file from the database
        const deletedFile = await db.file.delete({
          where: {
            id,
          },
        });

        return deletedFile;
      } catch (e: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e.message});
      }
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
  getFileMessages: authProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INIFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          text: true,
          createdAt: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        nextCursor = messages.pop()?.id;
      }

      return {
        messages: messages,
        nextCursor,
      };
    }),
  getFileMessagesCount: authProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input }) => {
      const { fileId } = input;
      const count = await db.message.count({
        where: {
          fileId,
        },
      });
      return count;
    }),
  getUserSubscriptionPlan: authProcedure.query(()=>{
    return getUserSubscriptionPlan();
  })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
