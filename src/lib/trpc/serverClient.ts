import { httpBatchLink } from "@trpc/client";
import { appRouter } from "@/lib/server";

export const serverClient = appRouter.createCaller({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
});
