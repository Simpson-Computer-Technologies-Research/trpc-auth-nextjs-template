"use client";

import Button from "@/components/Button";
import LoadingCenter from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignOutButton from "@/components/SignOutButton";
import { SessionProvider, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <SessionProvider>
      <Main />
    </SessionProvider>
  );
}

function Main(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  if (sessionStatus === "unauthenticated") {
    router.push("/auth/signin");

    return <LoadingCenter />;
  }

  if (sessionStatus === "loading") {
    return <LoadingCenter />;
  }

  if (sessionStatus === "authenticated" && session) {
    return (
      <MainWrapper className="gap-2">
        <h1 className="text-9xl font-bold">Welcome {session.user.name}!</h1>
        <div className="fixed top-0 flex w-screen flex-row items-center justify-between p-5">
          <Image
            src={session.user.image}
            width={65}
            height={65}
            className="rounded-full"
            alt="..."
          />
          <SignOutButton />
        </div>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper className="gap-2">
      <h1 className="text-6xl font-bold">Welcome</h1>
      <p className="mb-3">You are not signed in.</p>
      <Button href="/api/auth/signin">Sign in</Button>
    </MainWrapper>
  );
}
