import { Response } from "@/lib/responses";
import { publicProcedure } from "../trpc";
import { zstring } from "../utils/zod";
import { z } from "zod";
import { Prisma } from "@/lib/prisma";
import { verifyAuthorizationToken } from "@/lib/auth";
import { genId, sha256 } from "@/lib/crypto";

export const authRouter = {
  verifyToken: publicProcedure
    .input(z.object({ token: zstring(), email: zstring() }))
    .query(async ({ input }) => {
      try {
        // Check if the user already exists
        const user = await Prisma.getUserByEmail(input.email);
        if (user) {
          return {
            ...Response.InvalidQuery,
            message: "User already exists",
          };
        }

        const res = await verifyAuthorizationToken(
          10,
          input.token,
          input.email
        );

        return res
          ? { ...Response.Success, message: "Valid token" }
          : { ...Response.InvalidQuery, message: "Invalid token" };
      } catch {
        return {
          ...Response.InternalError,
          message: "Failed to verify token",
        };
      }
    }),
  getUserByEmail: publicProcedure
    .input(z.object({ email: zstring() }))
    .query(async ({ input }) => {
      try {
        const user = await Prisma.getUserByEmail(input.email);

        if (!user) {
          return {
            ...Response.InvalidQuery,
            message: "User not found",
            user: null,
          };
        }

        return { ...Response.Success, user };
      } catch {
        return {
          ...Response.InternalError,
          message: "Failed to get user",
          user: null,
        };
      }
    }),
  createUser: publicProcedure
    .input(
      z.object({
        token: zstring(),
        email: zstring(),
        password: zstring(),
        // name: zstring().optional(),
        // image: zstring().optional(),
      })
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
      try {
        let user = await Prisma.getUser(secret);

        // If the user doesn't exist, create them
        if (!user) {
          const id: string = await genId();
          const image = "/images/default-pfp.png";

          user = await Prisma.createUser(
            id,
            input.email,
            input.password,
            image,
            secret
          );
        }

        return { ...Response.Success, user };
      } catch (e) {
        return {
          ...Response.InternalError,
          message: "Failed to create user",
          user: null,
        };
      }
    }),
};
