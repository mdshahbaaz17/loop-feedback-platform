export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center py-20 px-8 bg-white dark:bg-black text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Welcome to Loop Feedback Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
          The ultimate platform for collecting, managing, and analyzing feedback from your users to improve your products.
        </p>
        <div className="flex gap-4">
          <a
            href="/dashboard"
            className="rounded-full bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
          <a
            href="/login"
            className="rounded-full border border-gray-300 dark:border-gray-700 px-8 py-3 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            Login
          </a>
        </div>
      </main>
    </div>
  );
}
