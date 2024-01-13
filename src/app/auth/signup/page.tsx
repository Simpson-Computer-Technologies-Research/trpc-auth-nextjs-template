"use client";

import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import SuccessMessage from "@/components/SuccessMessage";
import { PREVENT_TRPC_FETCH } from "@/lib/server/utils/configs";
import { trpc } from "@/lib/trpc/client";
import { FormEvent, useState } from "react";

enum SignUpStatus {
  IDLE,
  SUCCESS,
  ERROR,
  USER_EXISTS,
  LOADING,
}

export default function SignUpPage() {
  // States for email and password
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(SignUpStatus.IDLE);

  // tRPC Queries for checking if the user already exists and sending an email
  const { refetch: userExists } = trpc.getUserByEmail.useQuery(
    { email },
    PREVENT_TRPC_FETCH,
  );
  const { refetch: sendEmail } = trpc.sendEmail.useQuery(
    { email },
    PREVENT_TRPC_FETCH,
  );

  // onSubmit function
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus(SignUpStatus.LOADING);

    // Check if the user already exists - if so, set the status to user exists
    const userResponse = await userExists();
    if (userResponse.data?.success) {
      return setStatus(SignUpStatus.USER_EXISTS);
    }

    // Send an api request to send a verification email to the provided mail address
    const emailResponse = await sendEmail();

    emailResponse.data?.success // If the response is ok, set the status to success, else to error
      ? setStatus(SignUpStatus.SUCCESS)
      : setStatus(SignUpStatus.ERROR);
  };

  return (
    <MainWrapper>
      <form
        className="flex w-[40rem] flex-col gap-4 rounded-md border p-20"
        onSubmit={async (e) => await onSubmit(e)}
      >
        <h1 className="text-7xl font-extrabold tracking-wide text-gray-900">
          Create an account
        </h1>
        <p className="mb-2 text-gray-400">
          An email will be sent to you to verify your account. From there you
          can set your password and sign in.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border p-3 text-sm"
        />

        <Button type="submit" disabled={status === SignUpStatus.LOADING}>
          {status === SignUpStatus.LOADING ? (
            <LoadingRelative className="h-5 w-5 fill-white" />
          ) : (
            "Sign up"
          )}
        </Button>

        <SignInWithGoogleButton />

        <p className="my-4 text-gray-500">
          Already have an account?{" "}
          <a href="/auth/signin" className="underline">
            Sign in
          </a>
        </p>

        {/* The sign up was a success - they must check their email for verification */}
        {status === SignUpStatus.SUCCESS && (
          <SuccessMessage>
            An email has been sent to {email}. Check your inbox for a link to
            create your account.
          </SuccessMessage>
        )}

        {/* An error has occurred - most likely an internal error */}
        {status === SignUpStatus.ERROR && (
          <ErrorMessage>An error has occurred. Please try again.</ErrorMessage>
        )}

        {/* The user already exists - they must sign in to continue */}
        {status === SignUpStatus.USER_EXISTS && (
          <ErrorMessage>
            An user with this email already exists.{" "}
            <a href="/auth/signin" className="underline">
              Sign in
            </a>
          </ErrorMessage>
        )}
      </form>
    </MainWrapper>
  );
}
