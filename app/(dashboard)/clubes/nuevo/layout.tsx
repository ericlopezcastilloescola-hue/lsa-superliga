import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function NuevoClubGuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/clubes");

  return children;
}
