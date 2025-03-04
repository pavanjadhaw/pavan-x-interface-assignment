import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma/client";
import getUser from "@/utils/supabase/get-user";
import { RevisionStatus, Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { profile } = await getUser();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get cursor from URL if available
  const url = new URL(request.url);
  const searchParams = await url.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit") || "10");

  // Build the query
  const documentsQuery: Prisma.DocumentFindManyArgs = {
    where: {
      organizationId: profile.organizationId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc" as Prisma.SortOrder,
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
    take: limit,
  };

  // Add cursor if provided
  if (cursor) {
    documentsQuery.cursor = { id: cursor };
    documentsQuery.skip = 1;
  }

  // Execute the query
  const documents = await prisma.document.findMany(documentsQuery);

  // Get the next cursor
  const nextCursor =
    documents.length === limit ? documents[documents.length - 1].id : null;

  return NextResponse.json({
    documents,
    pagination: {
      nextCursor,
    },
  });
}
