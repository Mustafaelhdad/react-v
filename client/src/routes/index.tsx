import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { ExperiencesList } from "@/features/experiences/components/ExperiencesList";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context: { trpcQueryUtils } }) => {
    const experiences = await trpcQueryUtils.experiences.feed.prefetchInfinite(
      {},
    );
    return {
      experiences,
    };
  },
});

function Index() {
  const [{ pages }, experiencesQuery] =
    trpc.experiences.feed.useSuspenseInfiniteQuery(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  return (
    <InfiniteScroll
      hasNextPage={!!experiencesQuery.data?.pages[0]?.nextCursor}
      onLoadMore={experiencesQuery.fetchNextPage}
    >
      <ExperiencesList
        experiences={pages.flatMap((page) => page.experiences)}
        isLoading={experiencesQuery.isFetchingNextPage}
      />
    </InfiniteScroll>
  );
}
