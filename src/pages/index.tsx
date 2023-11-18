import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { UserButton } from "@clerk/nextjs";

import { api } from "~/utils/api";

export default function Home() {
  const user = useUser();

  const { data } = api.post.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Propertique</title>
        <meta name="description" content="Propertique" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <UserButton afterSignOutUrl="/" />
      </header>
      <main>
        <div>
          {data?.map((post) => <div key={post.id}>{post.content}</div>)}
        </div>
      </main>
    </>
  );
}
