import Head from "next/head";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { GetStaticProps, NextPage } from "next";
import PostView from "~/components/postview";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

dayjs.extend(relativeTime);



const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.post.getById.useQuery({
    id,
  });
  if (!data) return <div>Not found</div>;

  return (
    <>
      <Head>
        <title>{data.post.content}</title>
      </Head>

      <PageLayout>
        <PostView {...data}/>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("id must be string");


  await ssg.post.getById.prefetch({
    id
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SinglePostPage;
