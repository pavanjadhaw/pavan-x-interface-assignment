import { Group, Text } from "@mantine/core";
import Link from "next/link";
import { IconFileDescription, IconMessageCircle } from "@tabler/icons-react";
import { Document } from "@prisma/client";
import { DocumentsPageProps } from "../documents";

interface DocumentListProps {
  documents: DocumentsPageProps["initialDocuments"];
}

export const DocumentList = ({ documents }: DocumentListProps) => {
  return (
    <>
      {documents.map((document) => (
        <Link
          key={document.id}
          href={`/documents/${document.id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Group
            justify="space-between"
            style={{
              backgroundColor: "var(--mantine-color-gray-3)",
              borderRadius: "var(--mantine-radius-sm)",
              padding: "var(--mantine-spacing-xs)",
            }}
            my="xs"
          >
            <Group gap="xs">
              <IconFileDescription size={24} />
              <Text
                size="md"
                style={{
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                {document.title}
              </Text>
            </Group>
            {/** TODO: Add revision count */}
            <Group gap={4}>
              <Text size="sm">{document._count?.revisions ?? 0}</Text>
              <IconMessageCircle size={16} />
            </Group>
          </Group>
        </Link>
      ))}
    </>
  );
};

export default DocumentList;
