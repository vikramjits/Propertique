import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClients";
import type { Post } from "@prisma/client";

const addUserDataToPost = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);
  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author?.username) {
      if (!author?.firstName) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found!",
        });
      }
    }

    return {
      post,
      author,
    };
  });
}

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findMany({
        take: 100,
        where: { authorId: input.id },
        orderBy: { createdAt: "desc" },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return addUserDataToPost(post);

    }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emoji is allowed!").min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      //await new Promise((resolve) => setTimeout(resolve, 1000));

      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure.input(z.object({ id: z.string() }))
  .query( async ({ ctx, input }) => {
    const post = await ctx.db.post.findFirst({
      where: { id: parseInt(input.id) },
      orderBy: { createdAt: "desc" },
    });
    if(!post) throw new TRPCError({ code: "NOT_FOUND" });
    return (await addUserDataToPost([post]))[0];
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    return addUserDataToPost(posts);
  }),
});
