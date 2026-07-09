import { createClient } from "@/lib/supabase/server";
import CityGrid from "@/components/CityGrid";
import AddVisitForm from "@/components/AddVisitForm";
import DemoUserPicker from "@/components/DemoUserPicker";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  const { data: visits } = await supabase
    .from("visits")
    .select("id, city, start_date, end_date, activities, users(id, name, bio, linkedin_url, activity_preferences, payment_status)")
    .gte("end_date", new Date().toISOString().split("T")[0])
    .order("start_date", { ascending: true });

  const { data: users } = await supabase
    .from("users")
    .select("id, name, payment_status")
    .order("name");

  // Group visits by city
  const citiesMap: Record<string, { city: string; slug: string; count: number; nextDate: string }> = {};
  for (const v of visits ?? []) {
    if (!citiesMap[v.city]) {
      citiesMap[v.city] = {
        city: v.city,
        slug: encodeURIComponent(v.city),
        count: 0,
        nextDate: v.start_date,
      };
    }
    citiesMap[v.city].count++;
  }
  const cities = Object.values(citiesMap).sort((a, b) => b.count - a.count);

  return (
    <>
      <div className="bg-slate-950 px-4 py-10">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Unlock real connections.</h1>
          <p className="text-teal-300 font-medium">Meet someone during your trip.</p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2 text-sm text-slate-300">
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Find who&apos;s in the same city</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Find the common interest</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Send a private request</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Meet up in person!</li>
          </ul>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">How it works</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <li className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-sm text-gray-600">Pick your name below — no signup needed</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm text-gray-600">Add your upcoming trip</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-sm text-gray-600">Browse who else is visiting that city</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">4</span>
            <span className="text-sm text-gray-600">Send a private request to connect</span>
          </li>
        </ol>
      </div>

      <DemoUserPicker users={users ?? []} />

      <AddVisitForm />

      {cities.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No upcoming visits yet.</p>
          <p className="text-sm mt-1">Add yours above to get started!</p>
        </div>
      ) : (
        <CityGrid cities={cities} />
      )}
      </main>
    </>
  );
}
