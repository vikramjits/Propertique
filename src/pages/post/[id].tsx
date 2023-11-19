import Head from "next/head";

import { api } from "~/utils/api";


import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);


export default function SinglePostPage() {
  api.post.getAll.useQuery();
  return (
    <>
      <Head>
        <title>Propertique</title>
        <meta name="description" content="Propertique" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="flex h-screen justify-center">
        <div>Post view</div>
      </main>
    </>
  );
}
