import { Header } from "@/components/layout/Header/Header";

/** HEADER C: distraction-free checkout. No footer, no menu, no search. */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="c" />
      <main id="main">{children}</main>
    </>
  );
}
