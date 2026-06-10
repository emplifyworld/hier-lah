import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("connection_requests")
    .select("*, sender:users!sender_id(id, name, bio, linkedin_url, activity_preferences), recipient:users!recipient_id(id, name, bio, linkedin_url, activity_preferences)")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { sender_id, recipient_id, message } = body;

  if (!sender_id || !recipient_id) {
    return NextResponse.json({ error: "sender_id and recipient_id required" }, { status: 400 });
  }
  if (sender_id === recipient_id) {
    return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
  }

  // Check free tier limit
  const { data: user } = await supabase
    .from("users")
    .select("payment_status")
    .eq("id", sender_id)
    .single();

  if (user?.payment_status === "free") {
    const { data: sentRows } = await supabase
      .from("connection_requests")
      .select("id")
      .eq("sender_id", sender_id);
    if ((sentRows?.length ?? 0) >= 3) {
      return NextResponse.json({ error: "FREE_LIMIT_REACHED" }, { status: 402 });
    }
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("connection_requests")
    .select("id")
    .eq("sender_id", sender_id)
    .eq("recipient_id", recipient_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Request already sent" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("connection_requests")
    .insert({ sender_id, recipient_id, message: message ?? null, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: sender_id,
    action: "connection_sent",
    details: { recipient_id, status: "pending" },
  });

  return NextResponse.json(data, { status: 201 });
}
