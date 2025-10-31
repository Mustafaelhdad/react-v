import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { experienceFiltersSchema } from "@advanced-react/shared/schema/experience";
import { trpc } from "@/router";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { ExperiencesList } from "@/features/experiences/components/ExperiencesList";
import { ExperienceFilters } from "@/features/experiences/components/ExperienceFilters";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: experienceFiltersSchema,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const experiencesQuery = trpc.experiences.search.useInfiniteQuery(search, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!search.q,
  });

  return (
    <main className="space-y-4">
      <ExperienceFilters
        onFiltersChange={(filters) => {
          navigate({
            search: filters,
          });
        }}
        initialFilters={search}
      />

      <InfiniteScroll
        hasNextPage={!!experiencesQuery.data?.pages[0]?.nextCursor}
        onLoadMore={experiencesQuery.fetchNextPage}
      >
        <ExperiencesList
          experiences={
            experiencesQuery.data?.pages.flatMap((page) => page.experiences) ??
            []
          }
          isLoading={
            experiencesQuery.isLoading || experiencesQuery.isFetchingNextPage
          }
          noExperiencesMessage={
            !!search.q
              ? "No search query provided"
              : "Search to find experiences"
          }
        />
      </InfiniteScroll>
    </main>
  );
}
