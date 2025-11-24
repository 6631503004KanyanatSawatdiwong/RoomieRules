export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RoomieRules
          </h1>
          <p className="text-lg text-gray-600">
            Roommate bill sharing and house rules management
          </p>
        </div>

        <div className="card space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome to RoomieRules MVP
            </h2>
            <p className="text-gray-600">
              Split housing bills automatically, track payments, and manage shared expenses with your roommates.
            </p>
          </div>

          <div className="space-y-3">
            <a href="/register" className="btn btn-primary w-full">
              Get Started
            </a>
            <a href="/login" className="btn btn-secondary w-full">
              Sign In
            </a>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Built with Next.js 14, TypeScript & Tailwind CSS</p>
          <p className="mt-1">Mobile-first responsive design</p>
        </div>
      </div>
    </div>
  );
}
