import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sha256 } from "./crypto";
import Credentials from "next-auth/providers/credentials";
import { trpc } from "./trpc/serverClient";
import {
  generateAuthorizationToken,
  getTimeForAuthorizationToken,
} from "./auth";

export const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        /**
         * If the credentials are not provided, return null
         */
        if (!credentials) {
          return null;
        }

        /**
         * Get the user from the database
         */
        const data = await trpc.getUserByEmailUnsecure({
          email: credentials.email,
        });

        // Check the password
        const hashedProvidedPassword = await sha256(credentials.password);
        if (hashedProvidedPassword !== data.user?.password) {
          return null;
        }

        // Return the user
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
          secret: data.user.secret,
          permissions: data.user.permissions,
        };
      },
    }),
  ],

  callbacks: {
    async session({ session }) {
      /**
       * If the user is already logged in, return the session
       */
      if (session.user.id) {
        return session;
      }

      /**
       * Get the user from the database
       */
      const data = await trpc.getUserByEmailUnsecure({
        email: session.user.email,
      });

      /**
       * If the user does not exist, create the user
       */
      if (!data.user) {
        const time = getTimeForAuthorizationToken(0);
        const authToken = await generateAuthorizationToken(
          session.user.email,
          time,
        );

        await trpc.createUser({
          token: authToken,
          user: {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
          },
        });

        // Return the session
        return session;
      }

      // Set the session user id to the user's id
      session.user = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        image: data.user.image,
        secret: data.user.secret,
        permissions: data.user.permissions,
      };

      return session;
    },
  },
});
