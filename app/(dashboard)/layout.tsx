import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="w-full min-w-0 max-w-full">{children}</div>
    </AppShell>
  );
}
