import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma/client";
import getUser from "@/utils/supabase/get-user";
import { Prisma } from "@prisma/client";

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
  const activitiesQuery: Prisma.DocumentActivityFindManyArgs = {
    where: {
      organizationId: profile.organizationId,
    },
    orderBy: {
      createdAt: "desc" as Prisma.SortOrder,
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
  };

  // Add cursor if provided
  if (cursor) {
    activitiesQuery.cursor = { id: cursor };
    activitiesQuery.skip = 1;
  }

  // Execute the query
  const activities = await prisma.documentActivity.findMany(activitiesQuery);

  // Get the next cursor
  const nextCursor =
    activities.length === limit ? activities[activities.length - 1].id : null;

  return NextResponse.json({
    activities,
    pagination: {
      nextCursor,
    },
  });
}
