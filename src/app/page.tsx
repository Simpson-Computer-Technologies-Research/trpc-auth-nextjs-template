"use client";

import Button from "@/components/buttons/Button";
import LinkButton from "@/components/buttons/LinkButton";
import { LoadingSpinnerCenter } from "@/components/LoadingSpinner";
import MainWrapper from "@/components/MainWrapper";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <SessionProvider>
      <Components />
    </SessionProvider>
  );
}

function Components(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  if (sessionStatus === "unauthenticated") {
    router.push("/auth/signin");

    return <LoadingSpinnerCenter />;
  }

  if (sessionStatus === "loading") {
    return <LoadingSpinnerCenter />;
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
          <Button onClick={async () => await signOut()}>Sign out</Button>
        </div>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper className="gap-2">
      <h1 className="text-6xl font-bold">Welcome</h1>
      <p className="mb-3">You are not signed in.</p>
      <LinkButton href="/api/auth/signin">Sign in</LinkButton>
    </MainWrapper>
  );
}
