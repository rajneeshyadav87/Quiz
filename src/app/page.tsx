import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center mb-8">
          Quiz Management System
        </h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to Your Quiz Platform
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Create, manage, and take quizzes with ease
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/quizzes/create">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Create Quiz
              </button>
            </Link>
            <Link href="/quizzes">
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                View Quizzes
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}