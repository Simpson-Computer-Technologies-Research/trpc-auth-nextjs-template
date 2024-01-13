import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sha256 } from "./crypto";
import Credentials from "next-auth/providers/credentials";
import { trpc } from "./trpc/serverClient";
import {
  generateAuthorizationToken,
  getTimeForAuthorizationToken,
} from "./auth";
import { EMPTY_STRING } from "./constants";

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
        const bearerSecret: string | undefined = process.env.BEARER_SECRET;
        if (!bearerSecret) {
          throw new Error("BEARER_SECRET is not defined");
        }

        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        // Get the user from the database
        const data = await trpc.getUserByEmail({
          email: credentials.email,
        });

        const user = data?.user;
        if (!user) {
          return null;
        }

        // Check the password
        const hashedProvidedPassword = await sha256(credentials.password);
        if (hashedProvidedPassword !== user.password) {
          return null;
        }

        // Return the user
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          secret: user.secret,
        };
      },
    }),
  ],

  callbacks: {
    async session({ session }) {
      const bearerSecret: string | undefined = process.env.BEARER_SECRET;
      if (!bearerSecret) {
        throw new Error("BEARER_SECRET is not defined");
      }

      // If the user is already fetched from the database, return the session
      if (session.user.id) {
        return session;
      }

      // Get the user from the database
      const data = await trpc.getUserByEmail({
        email: session.user.email,
      });
      const user = data?.user;

      if (!user) {
        // Create the user
        const time = getTimeForAuthorizationToken(0);
        const authToken = await generateAuthorizationToken(
          session.user.email,
          time,
        );

        await trpc.createUser({
          token: authToken,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        });

        // Return the session
        return session;
      }

      // Set the session user id to the user's id
      session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        secret: user.secret,
      };

      return session;
    },
  },
});
