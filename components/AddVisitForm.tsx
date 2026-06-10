"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ACTIVITY_OPTIONS = ["coffee", "hiking", "meal", "movie"];
const CITY_OPTIONS = [
  "San Francisco, CA",
  "New York, NY",
  "London, UK",
  "Tokyo, Japan",
  "Austin, TX",
  "Other",
];

export default function AddVisitForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("San Francisco, CA");
  const [customCity, setCustomCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activities, setActivities] = useState<string[]>([]);

  function toggleActivity(a: string) {
    setActivities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const userId = localStorage.getItem("demo_user_id");
    if (!userId) { toast.error("Please select a user first"); return; }
    const finalCity = city === "Other" ? customCity.trim() : city;
    if (!finalCity) { toast.error("Please enter a city"); return; }
    if (!startDate || !endDate) { toast.error("Please select dates"); return; }
    if (endDate < startDate) { toast.error("End date must be after start date"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, city: finalCity, start_date: startDate, end_date: endDate, activities }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add visit");
      toast.success("Visit added!");
      setOpen(false);
      setCity("San Francisco, CA");
      setStartDate("");
      setEndDate("");
      setActivities([]);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add my visit
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">Add a visit</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {city === "Other" && (
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="City name..."
                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activities (optional)</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleActivity(a)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    activities.includes(a)
                      ? "bg-indigo-100 border-indigo-400 text-indigo-700"
                      : "bg-gray-50 border-gray-300 text-gray-600 hover:border-indigo-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save visit"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
