"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma/client";
import { createClient } from "@supabase/supabase-js";
import getQueryClient from "@/utils/get-query-client";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = await getSupabaseServerClient();

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
  const supabase = await getSupabaseServerClient();

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
  const queryClient = getQueryClient();
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  queryClient.clear();
  redirect("/login");
}
