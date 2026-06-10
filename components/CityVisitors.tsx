"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SendRequestModal from "./SendRequestModal";

const ACTIVITY_COLORS: Record<string, string> = {
  coffee: "bg-amber-100 text-amber-700",
  hiking: "bg-green-100 text-green-700",
  meal: "bg-orange-100 text-orange-700",
  movie: "bg-purple-100 text-purple-700",
};

interface Visit {
  id: string;
  city: string;
  start_date: string;
  end_date: string;
  activities: string[];
  users: {
    id: string;
    name: string;
    bio: string;
    linkedin_url: string;
    activity_preferences: string[];
    payment_status: string;
  };
}

interface Props {
  visits: Visit[];
  city: string;
  allUsers: { id: string; name: string }[];
  defaultStart?: string;
  defaultEnd?: string;
}

export default function CityVisitors({ visits, city, allUsers, defaultStart, defaultEnd }: Props) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(defaultStart ?? "");
  const [endDate, setEndDate] = useState(defaultEnd ?? "");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [modalRecipient, setModalRecipient] = useState<Visit["users"] | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = localStorage.getItem("demo_user_id") ?? "";
    setCurrentUserId(id);
  }, []);

  function applyFilter() {
    const params = new URLSearchParams();
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    router.push(`/city/${encodeURIComponent(city)}?${params.toString()}`);
  }

  function clearFilter() {
    setStartDate("");
    setEndDate("");
    router.push(`/city/${encodeURIComponent(city)}`);
  }

  function sharedActivities(a: string[], b: string[]) {
    return a.filter((x) => b.includes(x));
  }

  function handleSendRequest(user: Visit["users"]) {
    setModalRecipient(user);
  }

  async function onRequestSent(recipientId: string) {
    setSentRequests((prev) => new Set([...prev, recipientId]));
    setModalRecipient(null);
  }

  const myVisit = visits.find((v) => v.users?.id === currentUserId);
  const myActivities = myVisit?.activities ?? [];

  const displayedVisits = visits.filter((v) => v.users?.id !== currentUserId);

  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={applyFilter}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Filter
        </button>
        {(defaultStart || defaultEnd) && (
          <button onClick={clearFilter} className="text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>

      {/* My visit banner */}
      {myVisit && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-700">
          Your visit: <strong>{new Date(myVisit.start_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong> – <strong>{new Date(myVisit.end_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
          {myActivities.length > 0 && <span className="ml-2">· {myActivities.join(", ")}</span>}
        </div>
      )}

      {/* Visitor cards */}
      {displayedVisits.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No other visitors found.</p>
          <p className="text-sm mt-1">Try a wider date range or add your own visit.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedVisits.map((v) => {
            const u = v.users;
            if (!u) return null;
            const shared = sharedActivities(myActivities, v.activities ?? []);
            const alreadySent = sentRequests.has(u.id);
            const isSelf = u.id === currentUserId;

            return (
              <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-gray-900">{u.name}</span>
                      {u.payment_status === "paid" && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">Pro</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(v.start_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                      {new Date(v.end_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {u.bio && <p className="text-sm text-gray-600">{u.bio}</p>}

                  <div className="flex flex-wrap gap-1.5">
                    {(v.activities ?? []).map((a) => (
                      <span key={a} className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTIVITY_COLORS[a] ?? "bg-gray-100 text-gray-600"}`}>
                        {a}
                      </span>
                    ))}
                    {shared.length > 0 && (
                      <span className="text-xs text-indigo-600 font-medium ml-1">
                        ✓ {shared.length} shared interest{shared.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end justify-center">
                  <a
                    href={u.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    LinkedIn ↗
                  </a>
                  {!isSelf && (
                    <button
                      onClick={() => handleSendRequest(u)}
                      disabled={alreadySent}
                      className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${
                        alreadySent
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {alreadySent ? "✓ Request sent" : "Send request"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalRecipient && (
        <SendRequestModal
          recipient={modalRecipient}
          senderId={currentUserId}
          onClose={() => setModalRecipient(null)}
          onSent={() => onRequestSent(modalRecipient.id)}
        />
      )}
    </div>
  );
}
