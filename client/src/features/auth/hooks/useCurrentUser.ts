import { trpc } from "@/trpc";

export function useCurrentUser() {
  const currentUserQuery = trpc.auth.currentUser.useQuery();

  return {
    currentUser: currentUserQuery.data?.currentUser,
    accessToken: currentUserQuery.data?.accessToken,
  };
}
