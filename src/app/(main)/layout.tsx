import { AnnouncementBar, Footer } from "@/components/layout";
import { Header } from "@/components/layout/Header/Header";

/** HEADER A screens: Home, Shop listings, Search, Account dashboard. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header variant="a" />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
