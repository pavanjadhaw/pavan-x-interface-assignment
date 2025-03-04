import { prisma } from "@/utils/prisma/client";
import AuthForm from "../components/auth-form";

export default async function LoginPage() {
  const organizations = await prisma.organization.findMany({
    include: {
      users: true,
    },
    take: 2,
  });

  return <AuthForm type="login" organizations={organizations ?? []} />;
}
