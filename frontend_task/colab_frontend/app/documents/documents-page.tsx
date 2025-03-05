"use client";

import { getUser } from "@/hooks/use-user";
import { getDocuments } from "@/queries/get-documents";
import { getDocumentsCount } from "@/queries/get-documents-count";
import { getOrganizationActivity } from "@/queries/get-organization-activity";
import { useSupabaseClient } from "@/utils/supabase/client";
import { useSupabaseQuery } from "@/utils/supabase/supabase-query";
import { Group, Stack } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ActivityTimeline } from "./components/activity-timeline";
import { DocumentsTable } from "./components/documents-table";
import { NewDocumentDrawer } from "./components/new-document-drawer";
import { TimelineBottomSheet } from "./components/timeline-bottomsheet";
import { TimelineDrawer } from "./components/timeline-drawer";
import { useRealtimeDocuments } from "./hooks/use-realtime-documents";

type DocumentsPageProps = {
  initialPage?: number;
  initialPageSize?: number;
};

export const DocumentsPage = ({
  initialPage = 1,
  initialPageSize = 10,
}: DocumentsPageProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || initialPage);
  const pageSize = Number(searchParams.get("pageSize") || initialPageSize);

  const supabase = useSupabaseClient();
  const { data: profile } = getUser();

  const { data } = useSupabaseQuery(
    getDocuments(supabase, {
      organizationId: profile?.profile?.organization.id || "",
      page,
      pageSize,
    })
  );

  const { count } = useSupabaseQuery(
    getDocumentsCount(supabase, {
      organizationId: profile?.profile?.organization.id || "",
    })
  );

  const activityQuery = useSupabaseQuery(
    getOrganizationActivity(supabase, {
      organizationId: profile?.profile?.organization.id || "",
    })
  );

  useRealtimeDocuments(profile?.profile?.organization.id || "");

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <Stack>
        <Group justify="end">
          <NewDocumentDrawer />
          <TimelineDrawer>
            <ActivityTimeline activities={activityQuery.data || []} />
          </TimelineDrawer>
        </Group>
        <DocumentsTable
          page={page}
          documents={data || []}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </Stack>
      <TimelineBottomSheet>
        <ActivityTimeline activities={activityQuery.data || []} />
      </TimelineBottomSheet>
    </>
  );
};
