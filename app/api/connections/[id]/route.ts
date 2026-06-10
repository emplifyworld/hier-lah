import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await req.json();
  const { status, user_id } = body;

  if (!status || !["accepted", "declined"].includes(status)) {
    return NextResponse.json({ error: "status must be 'accepted' or 'declined'" }, { status: 400 });
  }

  // Verify the user is the recipient
  const { data: conn } = await supabase
    .from("connection_requests")
    .select("recipient_id, status")
    .eq("id", id)
    .single();

  if (!conn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conn.recipient_id !== user_id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (conn.status !== "pending") {
    return NextResponse.json({ error: "Already responded" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("connection_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
