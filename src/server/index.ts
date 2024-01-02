import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { testRouter } from "./routers/test";
import { emailRouter } from "./routers/email";

export const appRouter = router({
  ...authRouter,
  ...testRouter,
  ...emailRouter,
});

export type AppRouter = typeof appRouter;
