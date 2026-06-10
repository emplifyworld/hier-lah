const CITY_EMOJIS: Record<string, string> = {
  "San Francisco, CA": "🌉",
  "New York, NY": "🗽",
  "London, UK": "🎡",
  "Tokyo, Japan": "🗼",
  "Austin, TX": "🤠",
};

interface City {
  city: string;
  slug: string;
  count: number;
  nextDate: string;
}

export default function CityGrid({ cities }: { cities: City[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming visits by city</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((c) => (
          <a
            key={c.city}
            href={`/city/${c.slug}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="text-3xl mb-2">{CITY_EMOJIS[c.city] ?? "🌍"}</div>
            <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{c.city}</div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-indigo-600">{c.count}</span> {c.count === 1 ? "visitor" : "visitors"}
            </div>
            <div className="text-xs text-gray-400 mt-1">Next visit: {new Date(c.nextDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
