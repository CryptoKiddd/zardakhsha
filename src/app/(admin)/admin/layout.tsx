import type { Metadata } from "next";
import { requireStaff } from "@/features/admin/auth";
import { AdminShell } from "@/features/admin/components/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Zardakhsha" },
  robots: { index: false, follow: false },
};

/** Admin area: its own shell (sidebar + top bar), no storefront header/footer. Staff only. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireStaff();
  return <AdminShell user={user}>{children}</AdminShell>;
}
