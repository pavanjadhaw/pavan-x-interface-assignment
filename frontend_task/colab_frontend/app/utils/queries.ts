import { prisma } from "@/utils/prisma/client";
import { RevisionStatus } from "@prisma/client";
import { createClient } from "@/utils/supabase/client";

// User profile query
export async function fetchUserProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("Profile")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

// Documents query
export async function fetchDocuments({
  organizationId,
  limit = 10,
  cursor = null,
}: {
  organizationId: string;
  limit?: number;
  cursor?: string | null;
}) {
  if (!organizationId) return { documents: [], nextCursor: null };

  const documentsQuery: any = {
    where: {
      organizationId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      author: {
        select: {
          email: true,
        },
      },
      _count: {
        select: {
          revisions: {
            where: {
              status: RevisionStatus.PENDING,
            },
          },
        },
      },
    },
    take: limit + 1,
  };

  // Add cursor if provided
  if (cursor) {
    documentsQuery.cursor = { id: cursor };
    documentsQuery.skip = 1;
  }

  const documents = await prisma.document.findMany(documentsQuery);

  // If we got more than the limit, there are more documents
  const hasMore = documents.length > limit;
  const nextCursor = hasMore ? documents[limit - 1].id : null;

  // Return only the requested number of documents
  return {
    documents: documents.slice(0, limit),
    nextCursor,
  };
}

// Document activities query
export async function fetchDocumentActivities({
  organizationId,
  limit = 10,
}: {
  organizationId: string;
  limit?: number;
}) {
  if (!organizationId) return [];

  return prisma.documentActivity.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      actor: {
        select: {
          email: true,
        },
      },
      document: {
        select: {
          title: true,
        },
      },
    },
    take: limit,
  });
}
