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
    PREVENT_TRPC_FETCH
  );
  const { refetch: sendEmail } = trpc.sendEmail.useQuery(
    { email },
    PREVENT_TRPC_FETCH
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
    <MainWrapper className="gap-2 w-full">
      <h1 className="text-6xl font-thin my-7 uppercase">Sign up</h1>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={async (e) => await onSubmit(e)}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-black p-3 text-sm"
        />
        <Button type="submit" disabled={status === SignUpStatus.LOADING}>
          {status === SignUpStatus.LOADING ? (
            <LoadingRelative className="w-5 h-5" />
          ) : (
            "Sign up"
          )}
        </Button>
        <SignInWithGoogleButton />
      </form>

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
    </MainWrapper>
  );
}
