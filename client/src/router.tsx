import type { AppRouter } from "@advanced-react/server";
import {
  createTRPCReact,
  createTRPCQueryUtils,
  httpBatchLink,
} from "@trpc/react-query";
import { env } from "./lib/utils/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: env.VITE_SERVER_BASE_URL,
    }),
  ],
});

export const trcpQueryUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
});

function createRouter() {
  const router = createTanstackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: {
      trcpQueryUtils,
    },
    Wrap: function WrapComponent({ children }) {
      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      );
    },
  });

  return router;
}

export const router = createRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
