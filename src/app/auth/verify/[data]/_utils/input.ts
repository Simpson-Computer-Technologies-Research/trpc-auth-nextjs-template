import config from "@/lib/config/default.config";

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
    password.length < config.min.password ||
    password.length > config.max.password
  ) {
    return false;
  }

  return password === verificationPassword;
}
