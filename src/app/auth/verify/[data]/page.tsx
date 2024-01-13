"use client";

import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SuccessMessage from "@/components/SuccessMessage";
import { base64decode, sha256 } from "@/lib/crypto";
import { trpc } from "@/lib/trpc/client";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { isValidPassword } from "./_utils/input";
import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/lib/constants";

enum AuthStatus {
  IDLE,
  SUCCESS,
  LOADING,
  ERROR,
  INVALID_TOKEN,
}

export default function SignUpPage() {
  const path = usePathname();
  const router = useRouter();

  // When the user submits the form, send an api request to create their account
  const [password, setPassword] = useState("");
  const [verificationPassword, setVerificationPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState(AuthStatus.INVALID_TOKEN);

  // tRPC Query creating the user
  const { mutateAsync: createUser } = trpc.createUser.useMutation();

  // Get the encoded data from the path and decode it
  const data = path.split("/").pop();
  const decodedData = base64decode(data || "");
  const { email, token } = JSON.parse(decodedData);

  // Verify the token and store the status depending on the result
  const { mutateAsync: verifyToken } = trpc.verifyToken.useMutation(); // TODO: FIX

  useEffect(() => {
    verifyToken({ email, token }).then((res) => {
      res.success
        ? setStatus(AuthStatus.IDLE)
        : setStatus(AuthStatus.INVALID_TOKEN);
    });
  }, [email, token, verifyToken]);

  /**
   * When the user submits the form, send an api request to create their account
   * @param e The form event
   * @returns void
   */
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(AuthStatus.LOADING);

    // If the password is invalid, return an error
    if (password !== verificationPassword) {
      return setStatus(AuthStatus.ERROR);
    }

    // Send an api request to create the user's account
    const encryptedPassword = await sha256(password);
    const res = await createUser({
      email,
      token,
      password: encryptedPassword,
      name,
    });

    if (!res.success) {
      return setStatus(AuthStatus.ERROR);
    }

    router.push("/auth/signin");
    setStatus(AuthStatus.SUCCESS);
  };

  // Check if the token is valid. If not, return an error message to the user
  if (status === AuthStatus.INVALID_TOKEN) {
    return (
      <MainWrapper className="w-full gap-2">
        <h1 className="text-7xl font-extrabold tracking-wide text-gray-900">
          Invalid token
        </h1>
        <p className="my-4 text-gray-400">
          The token provided is invalid or has expired.
        </p>
        <Button href="/auth/signup">Sign up</Button>
      </MainWrapper>
    );
  }

  // Store whether the submission button should be disabled
  const disableSubmitButton =
    !isValidPassword(password, verificationPassword) ||
    status === AuthStatus.SUCCESS;

  // If the token is valid, return the password form
  return (
    <MainWrapper>
      <form
        className="flex w-[50rem] flex-col gap-4 rounded-md border p-20"
        onSubmit={async (e) => await onSubmit(e)}
      >
        <h1 className="text-7xl font-extrabold tracking-wide text-gray-900">
          Create an account
        </h1>
        <p className="my-4 text-gray-400">
          An email will be sent to you to verify your account. From there you
          can set your password and sign in.
        </p>
        <input
          value={email}
          disabled={true}
          className="rounded-md border p-3 text-sm disabled:opacity-50"
        />
        <input
          type="password"
          required={true}
          placeholder="Password"
          value={password}
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border p-3 text-sm"
        />
        <input
          type="password"
          value={verificationPassword}
          required={true}
          placeholder="Verify Password"
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          onChange={(e) => setVerificationPassword(e.target.value)}
          className="rounded-md border p-3 text-sm"
        />
        <input
          type="text"
          required={true}
          placeholder="Full Name"
          maxLength={MAX_NAME_LENGTH}
          minLength={MIN_NAME_LENGTH}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border p-3 text-sm"
        />

        <Button type="submit" disabled={disableSubmitButton}>
          {status === AuthStatus.LOADING ? (
            <LoadingRelative className="h-5 w-5 fill-white" />
          ) : (
            "Sign up"
          )}
        </Button>

        {/* If the inputted passwords don't match, return an error */}
        {password !== verificationPassword && (
          <ErrorMessage>Passwords do not match.</ErrorMessage>
        )}

        {/* If the inputted passwords are invalid, return an error */}
        {(password || verificationPassword) &&
          !isValidPassword(password, verificationPassword) && (
            <ErrorMessage>
              Password must be at least {MIN_PASSWORD_LENGTH} characters long.
            </ErrorMessage>
          )}

        {/* The sign up was a success - they can now sign in */}
        {status === AuthStatus.SUCCESS && (
          <SuccessMessage>
            Your account has been created.{" "}
            <a href="/auth/signin" className="underline hover:text-green-600">
              Sign in
            </a>
          </SuccessMessage>
        )}

        {/* An error has occurred - most likely an internal error */}
        <ErrorMessage>
          {status === AuthStatus.ERROR &&
            "Something went wrong. Please try again."}
        </ErrorMessage>
      </form>
    </MainWrapper>
  );
}
