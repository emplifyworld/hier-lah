import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (!userId) return NextResponse.json({ received: true });

    const supabase = await createClient();

    await supabase.from("payments").insert({
      user_id: userId,
      amount: (session.amount_total ?? 999) / 100,
      currency: session.currency ?? "usd",
      stripe_session_id: session.id,
      status: "completed",
    });

    await supabase
      .from("users")
      .update({ payment_status: "paid" })
      .eq("id", userId);

    await supabase.from("activity_logs").insert({
      user_id: userId,
      action: "payment_completed",
      details: { stripe_session_id: session.id, amount: (session.amount_total ?? 999) / 100 },
    });
  }

  return NextResponse.json({ received: true });
}
