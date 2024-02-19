import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { emailRouter } from "./routers/email";

export const appRouter = router({
  ...authRouter,
  ...emailRouter,
});

export type AppRouter = typeof appRouter;
