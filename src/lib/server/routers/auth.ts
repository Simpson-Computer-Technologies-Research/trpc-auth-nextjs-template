import { publicProcedure } from "../trpc";
import { z } from "zod";
import { Prisma } from "@/lib/prisma";
import { generateUserSecret, verifyAuthorizationToken } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";
import { v4 as uuidv4 } from "uuid";
import config from "@/lib/config/default.config";

/**
 * The auth router
 */
export const authRouter = {
  /**
   * Verify an authorization token
   *
   * @param token - The token to verify
   * @param email - The email to verify the token for
   * @returns If the token is valid
   */
  verifyToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
        email: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      /**
       * Check if the user already exists
       *
       * If the user already exists, return an error
       */
      const user = await Prisma.getUserByEmail(input.email);
      if (user) {
        return {
          valid: false,
          message: "User already exists",
        };
      }

      /**
       * Verify the authorization token
       */
      const res = await verifyAuthorizationToken(10, input.token, input.email);
      return res
        ? { valid: true, message: "Success" }
        : { valid: false, message: "Invalid token" };
    }),

  /**
   * Get whether a user exists
   *
   * @param email - The email to get whether the user exists for
   * @returns If the user exists
   */
  userExists: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      const exists = await Prisma.userExists(input.email);
      return {
        exists,
      };
    }),

  /**
   * Get a user by their email (unsecure)
   *
   * @param email - The email to get the user by
   * @returns The user
   */
  getUserByEmailUnsecure: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      /**
       * Get the user by their email
       */
      const user = await Prisma.getUserByEmailUnsecure(input.email);
      if (!user) {
        return {
          user: null,
          success: false,
          message: "User not found",
        };
      }

      /**
       * Return the user
       */
      return {
        user,
        success: true,
        message: "Success",
      };
    }),

  /**
   * Create a new user
   *
   * @param token - The token to verify the user with
   * @param user - The user to create
   * @returns The user
   */
  createUser: publicProcedure
    .input(
      z.object({
        token: z.string(),
        user: z.object({
          email: z.string(),
          password: z.string().optional(),
          name: z.string().optional(),
          image: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      /**
       * Verify the authorization token
       */
      const validToken = await verifyAuthorizationToken(
        20,
        input.token,
        input.user.email,
      );
      if (!validToken) {
        return {
          success: false,
          message: "Invalid token",
          user: null,
        };
      }

      /**
       * Generate the user's secret
       *
       * Check if the user already exists by their secret
       */
      const secret = await generateUserSecret(input.user.email);
      const user = await Prisma.getUserBySecret(secret);
      if (user) {
        return {
          success: false,
          message: "User already exists",
          user: null,
        };
      }

      /**
       * Create the user in the database
       */
      const newUser = await Prisma.createUser({
        secret,
        id: uuidv4(),
        email: input.user.email,
        password: input.user.password,
        permissions: config.user.permissions,
        image: input.user.image ?? config.user.image,
        name: input.user.name ?? config.user.name,
      });

      /**
       * Return the user
       */
      if (!newUser) {
        return {
          success: false,
          message: "Failed to create user",
          user: null,
        };
      }

      return {
        success: true,
        message: "Success",
        user: newUser,
      };
    }),
};
