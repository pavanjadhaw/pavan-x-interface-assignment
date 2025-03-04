"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma/client";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup({
  email,
  password,
  organizationName,
}: {
  email: string;
  password: string;
  organizationName: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect("/error");
  }

  if (data.user) {
    const organizationSlug = organizationName
      .toLowerCase()
      .replaceAll(" ", "-");

    let organization = await prisma.organization.findUnique({
      where: {
        slug: organizationSlug,
      },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
        },
      });
    }

    const profile = await prisma.profile.create({
      data: {
        id: data.user.id,
        email: email,
        organizationId: organization.id,
      },
    });
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
