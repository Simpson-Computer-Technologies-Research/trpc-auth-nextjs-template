"use client";

import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import SuccessMessage from "@/components/SuccessMessage";
import { base64decode, sha256 } from "@/lib/crypto";
import { PREVENT_TRPC_FETCH } from "@/lib/server/utils/configs";
import { trpc } from "@/lib/trpc/client";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
  const [status, setStatus] = useState(AuthStatus.IDLE);

  // tRPC Query creating the user
  const { mutateAsync: createUser } = trpc.createUser.useMutation();

  // Get the encoded data from the path and decode it
  const data = path.split("/").pop();
  const decodedData = base64decode(data || "");
  const { email, token } = JSON.parse(decodedData);

  // Verify the token and store the status depending on the result
  const { mutateAsync: verifyToken } = trpc.verifyToken.useMutation(); // TODO: FIX

  useEffect(() => {
    if (PREVENT_TRPC_FETCH) return;

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
      <MainWrapper className="gap-2 w-full">
        <h1 className="text-6xl font-thin my-7 uppercase">INVALID TOKEN</h1>
        <p className="text-red-500 mb-4">
          The token provided is invalid or has expired.
        </p>
        <Button href="/auth/signup">Sign up</Button>
      </MainWrapper>
    );
  }

  // Store whether the submission button should be disabled
  const disableSubmitButton =
    !password ||
    password !== verificationPassword ||
    status === AuthStatus.SUCCESS;

  // If the token is valid, return the password form
  return (
    <MainWrapper className="gap-2 w-full">
      <h1 className="text-6xl font-thin my-7 uppercase">Sign up</h1>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={async (e) => await onSubmit(e)}
      >
        <input
          value={email}
          disabled={true}
          className="border border-black p-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required={true}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-black p-3 text-sm"
        />
        <input
          type="password"
          placeholder="Verify Password"
          value={verificationPassword}
          required={true}
          onChange={(e) => setVerificationPassword(e.target.value)}
          className="border border-black p-3 text-sm"
        />

        <Button type="submit" disabled={disableSubmitButton}>
          {status === AuthStatus.LOADING ? (
            <LoadingRelative className="w-5 h-5" />
          ) : (
            "Sign up"
          )}
        </Button>

        <SignInWithGoogleButton />
      </form>

      {/* If the inputted passwords don't match, return an error */}
      {password !== verificationPassword && (
        <ErrorMessage>Passwords do not match.</ErrorMessage>
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
    </MainWrapper>
  );
}
