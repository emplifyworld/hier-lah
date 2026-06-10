import { createClient } from "@/lib/supabase/server";
import CityVisitors from "@/components/CityVisitors";

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function CityPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { start, end } = await searchParams;
  const city = decodeURIComponent(slug);

  const supabase = await createClient();

  let query = supabase
    .from("visits")
    .select("id, city, start_date, end_date, activities, users(id, name, bio, linkedin_url, activity_preferences, payment_status)")
    .eq("city", city)
    .order("start_date", { ascending: true });

  if (start && end) {
    query = query.lte("start_date", end).gte("end_date", start);
  }

  const { data: visits } = await query;

  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <a href="/" className="text-sm text-indigo-600 hover:underline">← All cities</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{city}</h1>
        <p className="text-gray-500 text-sm mt-1">{visits?.length ?? 0} upcoming visitor{visits?.length !== 1 ? "s" : ""}</p>
      </div>

      <CityVisitors visits={visits ?? []} city={city} allUsers={users ?? []} defaultStart={start} defaultEnd={end} />
    </main>
  );
}
