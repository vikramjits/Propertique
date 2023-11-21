import Head from "next/head";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postview";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

dayjs.extend(relativeTime);

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostById.useQuery({
    id: props.userId,
  });
  if (isLoading) return <LoadingPage />;
  if (!data || data.length === 0) return <div>user has not posted</div>;
  return (
    <div className="flex flex-col">
    {data.map((fullPost) => (
      <PostView {...fullPost} key={fullPost.post.id} />
    ))}
  </div>
  );
};

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

      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${
              data.username ?? data.emailAddress ?? "unknown"
            }'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? data.emailAddress ?? "unknown"
        }`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

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
