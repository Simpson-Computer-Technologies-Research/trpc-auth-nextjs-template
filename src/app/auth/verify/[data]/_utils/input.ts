import {
  MAX_PASSWORD_LENGTH,
  MAX_SOCIALS_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_SOCIALS_LENGTH,
} from "@/lib/constants";

/**
 * Check whether the socials are invalid
 * @param linkedIn The LinkedIn link to check
 * @param github The GitHub link to check
 * @returns true if the socials are invalid, false otherwise
 */
export function invalidSocials(linkedIn: string, github: string) {
  const linkedInLength = linkedIn.length;
  const githubLength = github.length;

  if (
    linkedInLength < MIN_SOCIALS_LENGTH ||
    linkedInLength > MAX_SOCIALS_LENGTH
  ) {
    return true;
  }

  if (githubLength < MIN_SOCIALS_LENGTH || githubLength > MAX_SOCIALS_LENGTH) {
    return true;
  }

  if (!linkedIn.includes("linkedin.com/in/")) {
    return true;
  }

  if (!github.includes("github.com/")) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is invalid
 * @param password The password to check
 * @param verificationPassword The verification password to check
 * @returns true if the password is invalid, false otherwise
 */
export function invalidPassword(
  password: string,
  verificationPassword: string
) {
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return true;
  }

  return password !== verificationPassword;
}
