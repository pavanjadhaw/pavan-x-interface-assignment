import { prisma } from "../prisma/client";
import { createClient } from "./server";
import { cache } from "react";

export default cache(async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      email: true,
      organizationId: true,
    },
  });

  return {
    user,
    profile,
  };
});
