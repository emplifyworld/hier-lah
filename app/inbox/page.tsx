import InboxClient from "@/components/InboxClient";

export const revalidate = 0;

export default function InboxPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <a href="/" className="text-sm text-indigo-600 hover:underline">← Home</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Connection Requests</h1>
      </div>
      <InboxClient />
    </main>
  );
}
