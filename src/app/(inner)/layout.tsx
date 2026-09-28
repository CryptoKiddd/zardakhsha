import { Footer } from "@/components/layout";
import { Header } from "@/components/layout/Header/Header";

/** HEADER B screens: Product, Reviews, Bag, Login, account sub-pages, content pages. */
export default function InnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="b" />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
