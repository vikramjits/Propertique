import { useUser } from "@clerk/nextjs/app-beta/client";
import Head from "next/head";
import { UserButton } from "@clerk/nextjs";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });


  return (
    <>
      <Head>
        <title>Propertique</title>
        <meta name="description" content="Propertique" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
				<UserButton afterSignOutUrl="/"/>
			</header>
      <main>
        
      </main>
    </>
  );
}
