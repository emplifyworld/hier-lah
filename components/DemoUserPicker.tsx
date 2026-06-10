"use client";
import { useEffect, useState } from "react";

interface User { id: string; name: string; payment_status: string }

export default function DemoUserPicker({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("demo_user_id");
    if (saved && users.find((u) => u.id === saved)) {
      setSelected(saved);
    } else {
      // Default to first FREE user so the payment gate is demonstrable
      const freeUser = users.find((u) => u.payment_status === "free") ?? users[0];
      if (freeUser) {
        setSelected(freeUser.id);
        localStorage.setItem("demo_user_id", freeUser.id);
      }
    }
  }, [users]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelected(e.target.value);
    localStorage.setItem("demo_user_id", e.target.value);
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <span className="text-sm text-indigo-700 font-medium whitespace-nowrap">👤 You are browsing as:</span>
      <select
        value={selected}
        onChange={handleChange}
        className="text-sm border border-indigo-300 rounded px-2 py-1 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.payment_status === "paid" ? "✓ paid" : "free – 3 request limit"})
          </option>
        ))}
      </select>
      <span className="text-xs text-indigo-500">(demo mode — no login required)</span>
    </div>
  );
}
