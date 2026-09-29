import { toast } from "@/components/ui";
import type { ActionResult } from "./types";

/** One toast for every add-to-bag path (card "+", options sheet, product page). Same id: adds don't stack. */
export function notifyAddedToBag(result: ActionResult, productName: string): void {
  if (result.ok) {
    toast.success("Added to bag", {
      id: "bag-add",
      description: productName,
      action: { label: "View bag", href: "/bag" },
    });
  } else {
    toast.error(result.message, { id: "bag-add" });
  }
}
