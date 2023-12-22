"use client";

import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingCenter, { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInButton from "@/components/SignInButton";
import { Status, type Response } from "@/lib/types";
import { trpc } from "@/trpc/client";
import { PREVENT_TRPC_FETCH } from "@/utils/trpc";
import { SessionProvider, useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  return (
    <SessionProvider>
      <Main />
    </SessionProvider>
  );
}

function Main(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();

  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [text, setText] = useState<string>("");
  const [data, setData] = useState<Response>();

  // tRPC Query (fetching data)
  const { refetch } = trpc.testQuery.useQuery(
    { text: "Hello" },
    PREVENT_TRPC_FETCH
  );

  // tRPC Mutation (updating data)
  const { mutate } = trpc.testMutate.useMutation();

  // Refetch the query
  async function onFetch() {
    const res = await refetch();

    setStatus(res.error ? Status.ERROR : Status.SUCCESS);
    setData(res.data);
  }

  if (sessionStatus === "loading") {
    return <LoadingCenter />;
  }

  if (sessionStatus === "authenticated" && session) {
    return (
      <MainWrapper>
        <h1 className="text-2xl font-bold">Welcome {session.user.name}</h1>
        <input
          className="border border-black px-4 py-3"
          placeholder="Enter text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={async () => await onFetch()}>Fetch data</Button>
        <Button onClick={async () => mutate({ text })}>Update data</Button>

        {status === Status.LOADING && <LoadingRelative />}
        {status === Status.SUCCESS && <ResponseData data={data!} />}
        {status === Status.ERROR && <ErrorMessage>Error!</ErrorMessage>}
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <SignInButton />
    </MainWrapper>
  );
}

function ResponseData({ data }: { data: Response }) {
  return (
    <p className="mt-3">
      <strong>Response data:</strong> {data.result}
    </p>
  );
}
