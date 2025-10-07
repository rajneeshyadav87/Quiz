'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  description?: string
  timeLimit?: number
  isPublished: boolean
  createdAt: string
  creator: {
    id: string
    name?: string
    email: string
  }
  _count: {
    questions: number
    quizAttempts: number
  }
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes')
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data)
      } else {
        setError('Failed to fetch quizzes')
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      setError('An error occurred while fetching quizzes')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) {
      return
    }

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId))
        alert('Quiz deleted successfully')
      } else {
        alert('Failed to delete quiz')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('An error occurred while deleting the quiz')
    }
  }

  const togglePublished = async (quizId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        })
      })

      if (response.ok) {
        setQuizzes(prev => 
          prev.map(quiz => 
            quiz.id === quizId 
              ? { ...quiz, isPublished: !currentStatus }
              : quiz
          )
        )
      } else {
        alert('Failed to update quiz status')
      }
    } catch (error) {
      console.error('Error updating quiz:', error)
      alert('An error occurred while updating the quiz')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading quizzes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">All Quizzes</h1>
          </div>
          <Link href="/quizzes/create">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Create New Quiz
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No Quizzes Found</h2>
            <p className="text-gray-600 mb-6">
              Get started by creating your first quiz!
            </p>
            <Link href="/quizzes/create">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create Your First Quiz
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex-1">
                    {quiz.title}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quiz.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {quiz.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                {quiz.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium">{quiz._count.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempts:</span>
                    <span className="font-medium">{quiz._count.quizAttempts}</span>
                  </div>
                  {quiz.timeLimit && (
                    <div className="flex justify-between">
                      <span>Time Limit:</span>
                      <span className="font-medium">{quiz.timeLimit} min</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Link href={`/quizzes/${quiz.id}`} className="flex-1">
                      <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
                        View Details
                      </button>
                    </Link>
                    {quiz.isPublished && (
                      <Link href={`/quizzes/${quiz.id}/take`} className="flex-1">
                        <button className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
                          Take Quiz
                        </button>
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePublished(quiz.id, quiz.isPublished)}
                      className={`flex-1 font-bold py-2 px-4 rounded text-sm ${
                        quiz.isPublished
                          ? 'bg-yellow-500 hover:bg-yellow-700 text-white'
                          : 'bg-gray-500 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {quiz.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}