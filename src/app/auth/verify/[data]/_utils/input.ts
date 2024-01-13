import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/constants";

/**
 * Check whether the password is valid
 * @param password The password to check
 * @param verificationPassword The verification password to check
 * @returns true if the password is valid, false otherwise
 */
export function isValidPassword(
  password: string,
  verificationPassword: string,
) {
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  return password === verificationPassword;
}
