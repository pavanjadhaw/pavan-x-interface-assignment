import { Table, Flex, Pagination } from "@mantine/core";
import page from "../page";
import { GetDocumentsResponse } from "@/queries/get-documents";
import { TimeAgo } from "./timeago";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DocumentsTableProps {
  page: number;
  totalPages: number;
  documents: GetDocumentsResponse;
  handlePageChange: (page: number) => void;
}

export const DocumentsTable = ({
  documents,
  totalPages,
  page,
  handlePageChange,
}: DocumentsTableProps) => {
  const router = useRouter();

  const rows = documents?.map((doc) => (
    <Table.Tr
      key={doc.id}
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/documents/${doc.id}`)}
    >
      <Table.Td>{doc.title}</Table.Td>
      <Table.Td align="center">{doc.revisionsCount[0].count ?? 0}</Table.Td>
      <Table.Td visibleFrom="md" align="right">
        {doc.author.email}
      </Table.Td>
      <Table.Td visibleFrom="md" align="right">
        <TimeAgo date={doc.updatedAt} size="sm" c="black" />
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Revisions</Table.Th>
            <Table.Th
              visibleFrom="md"
              style={{
                textAlign: "right",
              }}
            >
              Author
            </Table.Th>
            <Table.Th
              visibleFrom="md"
              style={{
                textAlign: "right",
              }}
            >
              Last updated
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      <Flex justify="flex-end">
        <Pagination
          size="sm"
          total={totalPages}
          value={page}
          onChange={handlePageChange}
        />
      </Flex>
    </>
  );
};
