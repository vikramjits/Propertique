import Head from "next/head";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import SuperJSON from "superjson";
import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";

dayjs.extend(relativeTime);

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
    emailAddress: username,
  });
  if (!data) return <div>Not found</div>;

  return (
    <>
      <Head>
        <title>{data.username ?? data.emailAddress}</title>
      </Head>

      <main className="flex h-fit justify-center border-x">
        <div className="flex h-screen w-full flex-col border-x  md:max-w-2xl">
          <div></div>
          <div className=" relative h-36 bg-slate-600">
            <Image
              src={data.profileImageUrl}
              alt={`${data.username ?? data.emailAddress}'s profile pic`}
              width={128}
              height={128}
              className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
            />
          </div>
          <div className="h-[64px]"></div>
          <div className="p-4 text-2xl font-bold">
            {data.username ?? data.emailAddress}
          </div>
          <div className="border-b border-slate-400"></div>
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: SuperJSON,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("slug must be string");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({
    username,
    emailAddress: username,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
