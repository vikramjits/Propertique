import { Image } from "next/dist/client/image-component";


import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import Link from "next/link";
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
          <Link href={`/@${author.username ?? author.emailAddress}`}>
            <span>{`@${author.username ?? author.firstName}`}</span>
            &nbsp;·&nbsp;
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

export default PostView;