"use server";

import { prisma } from "@/utils/prisma/client";
import { createClient } from "@/utils/supabase/server";
import {
  DocumentActionType,
  RevisionActionType,
  RevisionStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createDocument({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: string;
}) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.data.user?.id,
    },
  });

  if (!profile) {
    return;
  }

  const newDocument = await prisma.document.create({
    data: {
      id,
      title,
      content,
      organizationId: profile.organizationId,
      authorId: profile.id,
      activities: {
        create: {
          actorId: profile.id,
          actionType: DocumentActionType.CREATED,
          organizationId: profile.organizationId,
        },
      },
    },
  });

  revalidatePath("/documents");
}

export async function updateDocument({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: string;
}) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.data.user?.id,
    },
  });

  if (!profile) {
    return;
  }

  const updatedDocument = await prisma.document.update({
    where: {
      id,
      organizationId: profile.organizationId,
    },
    data: {
      title,
      content,
      activities: {
        create: {
          actorId: profile.id,
          actionType: DocumentActionType.UPDATED,
          organizationId: profile.organizationId,
        },
      },
    },
  });

  revalidatePath(`/documents/${id}`);
}

export async function deleteDocument({ id }: { id: string }) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.data.user?.id,
    },
  });

  if (!profile) {
    return;
  }

  await prisma.document.update({
    where: {
      id,
      organizationId: profile.organizationId,
    },
    data: {
      deletedAt: new Date(),
      activities: {
        create: {
          actorId: profile.id,
          actionType: DocumentActionType.DELETED,
          organizationId: profile.organizationId,
        },
      },
    },
  });

  revalidatePath("/documents");
}

export async function createRevision({
  id,
  documentId,
  content,
}: {
  id: string;
  documentId: string;
  content: string;
}) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.data.user?.id,
    },
  });

  if (!profile) {
    return;
  }

  const newRevision = await prisma.revision.create({
    data: {
      id,
      documentId,
      content,
      authorId: profile.id,
      activities: {
        create: {
          actorId: profile.id,
          actionType: RevisionActionType.CREATED,
        },
      },
    },
  });

  revalidatePath(`/documents/${documentId}`);
}

export async function acceptRevision({ id }: { id: string }) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.data.user?.id,
    },
  });

  if (!profile) {
    return;
  }

  const updatedRevision = await prisma.revision.update({
    where: {
      id,
    },
    data: {
      status: RevisionStatus.ACCEPTED,
      activities: {
        create: {
          actorId: profile.id,
          actionType: RevisionActionType.ACCEPTED,
        },
      },
    },
  });

  revalidatePath(`/documents/${updatedRevision.documentId}`);
}

export async function rejectRevision({ id }: { id: string }) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.data.user?.id,
    },
  });

  if (!profile) {
    return;
  }

  const updatedRevision = await prisma.revision.update({
    where: {
      id,
    },
    data: {
      status: RevisionStatus.REJECTED,
      activities: {
        create: {
          actorId: profile.id,
          actionType: RevisionActionType.REJECTED,
        },
      },
    },
  });

  revalidatePath(`/documents/${updatedRevision.documentId}`);
}
