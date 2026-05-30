import { redirect } from "next/navigation";

export default async function CalendarioRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/competiciones/${id}#calendario`);
}
