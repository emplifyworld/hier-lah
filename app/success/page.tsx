export default function SuccessPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <div className="text-5xl">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900">You&apos;re all set!</h1>
      <p className="text-gray-600">Your account is now upgraded. You can send unlimited connection requests.</p>
      <a
        href="/"
        className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Back to home
      </a>
    </main>
  );
}
