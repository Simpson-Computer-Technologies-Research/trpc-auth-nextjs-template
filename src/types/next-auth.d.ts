import { Permission } from "@/types/types";
import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    image: string;
    secret: string;
    permissions: string[];
  }

  interface Session {
    user: User;
  }
}
