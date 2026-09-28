import { IconButton } from "@/components/ui";
import { getCart } from "../queries";

/** Async Server Component: streams the bag count into the header (wrapped in Suspense). */
export async function BagButton() {
  const { count } = await getCart().catch(() => ({ count: 0 }));
  return (
    <IconButton
      icon="bag"
      href="/bag"
      label={count > 0 ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag"}
      badge={count}
    />
  );
}
