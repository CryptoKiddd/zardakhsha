import { NextResponse } from "next/server";
import { z } from "zod";
import { syncPayment } from "@/features/orders/payments";

const callback = z.object({
  body: z.object({ external_order_id: z.string().regex(/^ZK-\d{6}$/) }),
});

/**
 * BOG payment callback. The request body is only used to know WHICH order changed: syncPayment re-reads
 * the real status from BOG's API, so a forged callback can't mark anything paid.
 */
export async function POST(request: Request) {
  const parsed = callback.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    await syncPayment(parsed.data.body.external_order_id);
  } catch (error) {
    console.error("BOG callback sync failed", error);
    return NextResponse.json({ ok: false }, { status: 500 }); // non-2xx: BOG retries the callback
  }
  return NextResponse.json({ ok: true });
}
