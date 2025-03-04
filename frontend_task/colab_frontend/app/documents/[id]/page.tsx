import { prisma } from "@/utils/prisma/client";
import getUser from "@/utils/supabase/get-user";
import DocumentPage from "./document";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function DocumentPageContainer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getUser();

  // Create a new QueryClient instance for server-side rendering
  const queryClient = new QueryClient();

  // Fetch the document data
  const document = await prisma.document.findUnique({
    where: {
      id,
      organizationId: profile!.organizationId,
    },
    include: {
      activities: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          actor: true,
        },
      },
      revisions: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
            },
          },
          activities: {
            include: {
              actor: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!document) {
    return <div>Document not found</div>;
  }

  // Prefetch and cache the document data
  await queryClient.prefetchQuery({
    queryKey: ["documents", id],
    queryFn: () => document,
  });

  // Dehydrate the cache to pass it to the client
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <DocumentPage initialDocument={document} />
    </HydrationBoundary>
  );
}
