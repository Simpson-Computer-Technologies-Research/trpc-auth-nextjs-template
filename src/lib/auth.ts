import { base64encode, sha256 } from "./crypto";

/**
 * Generate a URL to verify an email
 *
 * @param email The email to generate the authorization token for
 * @returns The URL to verify the email
 */
export async function generateEmailAuthorizationUrl(email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const route = `/auth/verify/`;

  const time = getTimeForAuthorizationToken(0);
  const token = await generateAuthorizationToken(email, time);
  const data = JSON.stringify({
    email,
    token,
  });

  const b64Encoded = base64encode(data);
  return `${baseUrl}${route}${b64Encoded}`;
}

/**
 * Verify an authorization token
 *
 * @param time The time to verify the token for
 * @param token The token to verify
 * @param email The email to verify the token for
 * @returns If the token is valid
 */
export async function verifyAuthorizationToken(
  time: number,
  token: string,
  email: string,
) {
  // Check if the provided token was create in the past 10 minutes
  for (let i = -1; i < time; i++) {
    const time = getTimeForAuthorizationToken(i);
    const generatedToken = await generateAuthorizationToken(email, time);

    if (generatedToken === token) {
      return true;
    }
  }

  return false;
}

/**
 * Get the time to generate an authorization token for
 *
 * @param offset The offset to generate the time for
 * @returns The time to generate the authorization token for
 */
export function getTimeForAuthorizationToken(offset: number) {
  return Math.floor(Date.now() / 1000 / 60) - offset; // Return the time in minutes
}

/**
 * Generate an authorization token for a user
 *
 * @param email The email to generate the authorization token for
 * @param time The time to generate the authorization token for
 * @returns The authorization token
 */
export async function generateAuthorizationToken(email: string, time: number) {
  return await sha256(email + process.env.NEXTAUTH_SECRET + time.toString()); // Hash the email, secret, and time
}

/**
 * Generate an user secret
 *
 * @param email The email to generate the user secret for
 * @returns The user secret
 */
export async function generateUserSecret(email: string) {
  return await sha256(email + process.env.NEXTAUTH_SECRET); // Hash the email and secret
}
