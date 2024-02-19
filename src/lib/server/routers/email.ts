import { publicProcedure } from "../trpc";
import { z } from "zod";
import { generateEmailAuthorizationUrl } from "@/lib/auth";

/**
 * The email router
 */
export const emailRouter = {
  /**
   * Send an email to a user
   *
   * @param email - The email to send the email to
   * @returns If the email was sent
   */
  sendEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      /**
       * The base URL for the SMTP provider
       */
      const baseUrl = process.env.SMTP_PROVIDER_BASE_URL;
      if (!baseUrl) {
        return {
          success: false,
          message: "SMTP Base URL not found",
        };
      }

      /**
       * Generate the request body for the email
       *
       * Then send the email
       */
      const body = await generateEmailRequestBody(input.email);
      const res = await fetch(`${baseUrl}/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      /**
       * Return if the email was sent
       */
      return res.ok
        ? { success: true, message: "Email sent" }
        : { success: false, message: "Email not sent" };
    }),
};

/**
 * Generate the request body for an email
 *
 * @param email The email to generate the request body for
 * @returns The request body
 */
async function generateEmailRequestBody(email: string) {
  const apiKey = process.env.SMTP_PROVIDER_API_KEY;
  const senderEmail = process.env.SMTP_SENDER_EMAIL;
  const url = await generateEmailAuthorizationUrl(email);

  return {
    api_key: apiKey,
    to: [`<${email}>`],
    sender: senderEmail,
    subject: "Account Creation",
    text_body: `Your account creation link is: ${url}\n\nThis link will expire in 10 minutes.`,
    html_body: `<p>Your account creation link is: <a href="${url}">${url}</a></p><p>This link will expire in 10 minutes.</p>`,
  };
}
