import { Response } from "@/lib/responses";
import { publicProcedure, router } from "../trpc";
import { zstring } from "../utils/zod";
import { z } from "zod";

export const testRouter = {
  testQuery: publicProcedure
    .input(z.object({ text: zstring() }))
    .query(async ({ input }) => {
      return { ...Response.Success, result: input.text };
    }),
  testMutate: publicProcedure
    .input(z.object({ text: zstring() }))
    .mutation(async ({ input }) => {
      return { ...Response.Success, result: input.text };
    }),
};
