import type { User } from "@clerk/nextjs/api";

export const filterUserForClient = (user: User) => {

  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.imageUrl,
    firstName: user.firstName,
    emailAddress: user.emailAddresses[0]?.emailAddress,
  };
};