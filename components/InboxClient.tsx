"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-gray-100 text-gray-500",
};

interface Connection {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  status: string;
  mutual_connections_count: number;
  created_at: string;
  sender: { id: string; name: string; bio: string; linkedin_url: string; activity_preferences: string[] };
  recipient: { id: string; name: string; bio: string; linkedin_url: string; activity_preferences: string[] };
}

export default function InboxClient() {
  const [userId, setUserId] = useState<string>("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("demo_user_id") ?? "";
    setUserId(id);
    if (id) fetchConnections(id);
    else setLoading(false);
  }, []);

  async function fetchConnections(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/connections?user_id=${id}`);
      const data = await res.json();
      setConnections(data ?? []);
    } catch {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  }

  async function respond(id: string, status: "accepted" | "declined") {
    try {
      const res = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConnections((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
      toast.success(status === "accepted" ? "Connection accepted!" : "Request declined");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to respond");
    }
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;
  if (!userId) return <div className="text-gray-500 text-sm">Select a user on the homepage first.</div>;

  const received = connections.filter((c) => c.recipient_id === userId);
  const sent = connections.filter((c) => c.sender_id === userId);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Received ({received.length})</h2>
        {received.length === 0 ? (
          <p className="text-gray-400 text-sm">No requests received yet.</p>
        ) : (
          <div className="space-y-3">
            {received.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-gray-900">{c.sender?.name}</span>
                    {c.mutual_connections_count > 0 && (
                      <span className="ml-2 text-xs text-gray-500">{c.mutual_connections_count} mutual connection{c.mutual_connections_count > 1 ? "s" : ""}</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status]}`}>
                    {c.status}
                  </span>
                </div>

                {c.sender?.bio && <p className="text-sm text-gray-600">{c.sender.bio}</p>}
                {c.message && (
                  <blockquote className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border-l-4 border-indigo-300 italic">
                    "{c.message}"
                  </blockquote>
                )}

                {c.status === "accepted" && (
                  <a href={c.sender?.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline inline-block">
                    View LinkedIn profile ↗
                  </a>
                )}

                {c.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => respond(c.id, "accepted")}
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(c.id, "declined")}
                      className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Sent ({sent.length})</h2>
        {sent.length === 0 ? (
          <p className="text-gray-400 text-sm">No requests sent yet.</p>
        ) : (
          <div className="space-y-3">
            {sent.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-gray-900">To: {c.recipient?.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                {c.message && (
                  <p className="text-sm text-gray-600 italic">"{c.message}"</p>
                )}
                {c.status === "accepted" && (
                  <a href={c.recipient?.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline inline-block">
                    View LinkedIn profile ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
