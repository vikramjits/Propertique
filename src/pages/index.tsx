import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { Image } from "next/dist/client/image-component";
import { UserButton } from "@clerk/nextjs";

import { api } from "~/utils/api";

import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user, isLoaded } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) toast.error(errorMessage[0]);
    },
  });

  if (!user) return null;
  if (!isLoaded) return <div />;

  return (
    <div className="flex w-full gap-3">
      <input
        placeholder="type some emoji"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "" && !isPosting) {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

//helper

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        width="56"
        height="56"
        className="h-14 w-14 rounded-full"
        alt=""
        placeholder="empty"
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <span>{`@${author.username ?? author.firstName}`}</span>&nbsp;·&nbsp;
          <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.post.getAll.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;
  return (
    <div className="flex w-full flex-col border-x md:max-w-2xl">
      {[...data]?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  api.post.getAll.useQuery();
  return (
    <>
      <Head>
        <title>Propertique</title>
        <meta name="description" content="Propertique" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="flex justify-center">
        <div className="flex w-full gap-4 border-x border-b border-slate-400 p-4 md:max-w-2xl">
          <div>
            <UserButton afterSignOutUrl="/" />
          </div>
          <CreatePostWizard />
        </div>
      </header>
      <main className="flex h-screen justify-center">
        <Feed />
      </main>
    </>
  );
}
