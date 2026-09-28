import { Header } from "@/components/layout/Header/Header";

/** HEADER C without back arrow: the order is placed, going "back" to checkout makes no sense. */
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="c" showBack={false} />
      <main id="main">{children}</main>
    </>
  );
}
