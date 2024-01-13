import { Response } from "@/lib/responses";
import { publicProcedure } from "../trpc";
import { zstring } from "../utils/zod";
import { z } from "zod";
import { Prisma } from "@/lib/prisma";
import { verifyAuthorizationToken } from "@/lib/auth";
import { genId, sha256 } from "@/lib/crypto";
import { DEFAULT_USER_IMAGE, EMPTY_STRING } from "@/lib/constants";

export const authRouter = {
  verifyToken: publicProcedure
    .input(
      z.object({
        token: zstring(),
        email: zstring(),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if the user already exists
      const user = await Prisma.getUserByEmail(input.email);
      if (user) {
        return {
          ...Response.InvalidQuery,
          message: "User already exists",
        };
      }

      const res = await verifyAuthorizationToken(10, input.token, input.email);

      return res
        ? { ...Response.Success, message: "Valid token" }
        : { ...Response.InvalidQuery, message: "Invalid token" };
    }),
  getUserByEmail: publicProcedure
    .input(z.object({ email: zstring() }))
    .query(async ({ input }) => {
      const user = await Prisma.getUserByEmail(input.email);

      if (!user) {
        return {
          ...Response.InvalidQuery,
          message: "User not found",
          user: null,
        };
      }

      return { ...Response.Success, user };
    }),
  createUser: publicProcedure
    .input(
      z.object({
        token: zstring(),
        email: zstring(),
        password: zstring().optional(),
        name: zstring().optional(),
        image: zstring().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const res = await verifyAuthorizationToken(20, input.token, input.email);
      if (!res) {
        return {
          ...Response.InvalidQuery,
          message: "Invalid token",
          user: null,
        };
      }

      // Generate a new user secret
      const bearerSecret = process.env.BEARER_SECRET;
      if (!bearerSecret) {
        return Response.InternalError;
      }

      // Get the user's info
      const secret: string = await sha256(input.email + bearerSecret);
      let user = await Prisma.getUser(secret).catch(() => null);

      // If the user doesn't exist, create them
      if (!user) {
        const id: string = await genId();

        user = await Prisma.createUser({
          id,
          secret,
          image: input.image || DEFAULT_USER_IMAGE,
          email: input.email,
          password: input.password || EMPTY_STRING,
          name: input.name || EMPTY_STRING,
        });

        if (!user) {
          return {
            ...Response.InternalError,
            message: "Failed to create user",
            user: null,
          };
        }
      }

      return { ...Response.Success, user };
    }),
};
