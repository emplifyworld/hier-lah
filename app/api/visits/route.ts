import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let query = supabase
    .from("visits")
    .select("id, city, start_date, end_date, activities, users(id, name, bio, linkedin_url, activity_preferences, payment_status)")
    .order("start_date", { ascending: true });

  if (city) query = query.eq("city", city);
  if (start && end) {
    // Overlapping date ranges: visit.start <= end AND visit.end >= start
    query = query.lte("start_date", end).gte("end_date", start);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { user_id, city, start_date, end_date, activities } = body;

  if (!user_id || !city || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("visits")
    .insert({ user_id, city, start_date, end_date, activities: activities ?? [] })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
