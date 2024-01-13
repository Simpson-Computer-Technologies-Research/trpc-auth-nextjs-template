import { Response } from "@/lib/responses";
import { publicProcedure } from "../trpc";
import { zstring } from "../utils/zod";
import { z } from "zod";
import { generateEmailAuthorizationUrl } from "@/lib/auth";

async function generateEmailRequestBody(email: string) {
  const api_key = process.env.SMTP_PROVIDER_API_KEY;
  const sender_email = process.env.SMTP_SENDER_EMAIL;
  const url = await generateEmailAuthorizationUrl(email);

  return {
    api_key,
    to: [`<${email}>`],
    sender: sender_email,
    subject: "Account Creation",
    text_body: `Your account creation link is: ${url}\n\nThis link will expire in 10 minutes.`,
    html_body: `<p>Your account creation link is: <a href="${url}">${url}</a></p><p>This link will expire in 10 minutes.</p>`,
  };
}

export const emailRouter = {
  sendEmail: publicProcedure
    .input(z.object({ email: zstring() }))
    .query(async ({ input }) => {
      // Send an email to the user
      const baseUrl = process.env.SMTP_PROVIDER_BASE_URL;
      if (!baseUrl) {
        return Response.InternalError;
      }

      // Generate the body and send the http request
      const body = await generateEmailRequestBody(input.email);
      const response = await fetch(`${baseUrl}/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return Response.InternalError;
      }

      return Response.Success;
    }),
};
