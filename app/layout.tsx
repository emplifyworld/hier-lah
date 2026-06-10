import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Are You Here?",
  description: "Discover who else is visiting your city and arrange private meet-ups.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="text-lg font-bold text-indigo-600 tracking-tight">Are You Here?</a>
            <a href="/inbox" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Inbox</a>
          </div>
        </nav>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
