import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { ExperiencesList } from "@/features/experiences/components/ExperiencesList";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const experiencesQuery = trpc.experiences.feed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  return (
    <InfiniteScroll
      hasNextPage={!!experiencesQuery.data?.pages[0]?.nextCursor}
      onLoadMore={experiencesQuery.fetchNextPage}
    >
      <ExperiencesList
        experiences={
          experiencesQuery.data?.pages.flatMap((page) => page.experiences) ?? []
        }
        isLoading={
          experiencesQuery.isLoading || experiencesQuery.isFetchingNextPage
        }
      />
    </InfiniteScroll>
  );
}
