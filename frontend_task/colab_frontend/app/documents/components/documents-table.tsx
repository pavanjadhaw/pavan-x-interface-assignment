import { Table, Text, Group, ActionIcon, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { DocumentWithAuthor } from "@/app/hooks/useQueries";
import { useRouter } from "next/navigation";
import ActivityTime from "@/components/activity-time/activity-time";

interface DocumentsTableProps {
  documents: DocumentWithAuthor[];
  onEdit?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const router = useRouter();

  if (!documents || documents.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No documents found. Create a new document to get started.
      </Text>
    );
  }

  const rows = documents.map((doc) => (
    <Table.Tr
      key={doc.id}
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/documents/${doc.id}`)}
    >
      <Table.Td>{doc.title}</Table.Td>
      <Table.Td align="right">{doc._count?.revisions ?? 0}</Table.Td>
      <Table.Td visibleFrom="md" align="right">
        {doc.author.email}
      </Table.Td>
      <Table.Td visibleFrom="md" align="right">
        <ActivityTime date={doc.updatedAt} size="sm" c="black" />
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table highlightOnHover stickyHeader stickyHeaderOffset={0} withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Title</Table.Th>
          <Table.Th>Pending</Table.Th>
          <Table.Th visibleFrom="md">Author</Table.Th>
          <Table.Th visibleFrom="md">Last updated</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
