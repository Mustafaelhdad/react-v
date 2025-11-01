import { trpc } from "@/trpc";

export function useCurrentUser() {
  const currentUserQuery = trpc.auth.currentUser.useQuery();

  return {
    accessToken: currentUserQuery.data?.accessToken,
    currentUser: currentUserQuery.data?.currentUser,
  };
}
