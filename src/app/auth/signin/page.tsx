"use client";

import Button from "@/components/buttons/Button";
import ErrorMessage from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import MainWrapper from "@/components/MainWrapper";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

/**
 * Status enum
 */
enum Status {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

/**
 * Sign in page component
 *
 * @returns JSX.Element
 */
export default function SignInPage() {
  // Get the callback url from the query parameters
  const [callbackUrl, setCallbackUrl] = useState("/");
  const [error, setError] = useState<string>();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get("callbackUrl");
    if (callbackUrl) {
      setCallbackUrl(callbackUrl);
    }

    const error = urlParams.get("error");
    if (error) {
      setError(error);
    }
  }, []);

  // States for email, password, and status
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.IDLE);

  // onSubmit function
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus(Status.LOADING);

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: true,
    });

    setStatus(res?.error ? Status.ERROR : Status.SUCCESS);
  };

  return (
    <MainWrapper>
      <form
        className="flex w-[40rem] flex-col gap-4 rounded-md border p-20"
        onSubmit={async (e) => await onSubmit(e)}
      >
        <h1 className="text-7xl font-extrabold tracking-wide text-gray-900">
          Account Sign In
        </h1>
        <p className="mb-2 text-gray-400">
          Sign in to see your hackathon dashboard, manage socials, update your
          resume, and more!
        </p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border p-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border p-3 text-sm"
        />
        <Button type="submit">
          {status === Status.LOADING ? (
            <LoadingSpinner className="h-5 w-5 fill-white" />
          ) : (
            <p>Sign in with credentials</p>
          )}
        </Button>

        <SignInWithGoogleButton />

        <p className="my-4 text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="underline">
            Sign up
          </a>
        </p>

        {error && (
          <ErrorMessage>
            {error === "CredentialsSignin" && "Incorrect email or password"}
          </ErrorMessage>
        )}
      </form>
    </MainWrapper>
  );
}
