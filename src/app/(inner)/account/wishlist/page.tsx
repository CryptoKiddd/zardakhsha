import type { Metadata } from "next";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { routes } from "@/config/navigation";
import s from "@/features/account/components/AccountPage.module.scss";
import { requireUser } from "@/features/account/queries";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { getWishlist } from "@/features/wishlist/queries";

export const metadata: Metadata = { title: "Saved" };

export default async function WishlistPage() {
  await requireUser("/account/wishlist");
  const products = await getWishlist();

  return (
    <Container className={s.page}>
      <h1>Saved</h1>
      {products.length === 0 ? (
        <>
          <p className={s.muted}>
            Tap the <Icon name="heart" size={16} /> on any piece to keep it here.
          </p>
          <ButtonLink href={routes.shop("new")}>Browse the atelier</ButtonLink>
        </>
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  );
}
