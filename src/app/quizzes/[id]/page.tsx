'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Question {
  id: string
  text: string
  type: string
  points: number
  order: number
  options: {
    id: string
    text: string
    isCorrect: boolean
    order: number
  }[]
}

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
  questions: Question[]
}

export default function QuizDetails() {
  const params = useParams()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`)
        if (response.ok) {
          const data = await response.json()
          setQuiz(data)
        } else {
          setError('Failed to fetch quiz')
        }
      } catch (error) {
        console.error('Error fetching quiz:', error)
        setError('An error occurred while fetching the quiz')
      } finally {
        setIsLoading(false)
      }
    }

    if (quizId) {
      fetchQuiz()
    }
  }, [quizId])

  const togglePublished = async () => {
    if (!quiz) return

    try {
      const response = await fetch(`/api/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !quiz.isPublished
        })
      })

      if (response.ok) {
        setQuiz(prev => prev ? { ...prev, isPublished: !prev.isPublished } : null)
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading quiz...</div>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Quiz not found'}
          </div>
          <Link href="/quizzes" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/quizzes" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Quizzes
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  quiz.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-sm text-gray-500">
                  Created: {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={togglePublished}
                className={`font-bold py-2 px-4 rounded ${
                  quiz.isPublished
                    ? 'bg-yellow-500 hover:bg-yellow-700 text-white'
                    : 'bg-green-500 hover:bg-green-700 text-white'
                }`}
              >
                {quiz.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              {quiz.isPublished && (
                <Link href={`/quizzes/${quiz.id}/take`}>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Take Quiz
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Questions</label>
              <p className="text-lg font-semibold">{quiz.questions.length}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Points</label>
              <p className="text-lg font-semibold">
                {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time Limit</label>
              <p className="text-lg font-semibold">
                {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No limit'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Creator</label>
              <p className="text-lg font-semibold">{quiz.creator.name || quiz.creator.email}</p>
            </div>
          </div>
          {quiz.description && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-700">{quiz.description}</p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Questions</h2>
          {quiz.questions.length === 0 ? (
            <p className="text-gray-600">No questions added yet.</p>
          ) : (
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-lg">
                      Question {index + 1}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <p className="text-gray-800 mb-3">{question.text}</p>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Type: {question.type.replace('_', ' ')}
                  </div>

                  {question.type === 'MULTIPLE_CHOICE' && question.options.length > 0 && (
                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-2">Options:</p>
                      <div className="space-y-1">
                        {question.options
                          .sort((a, b) => a.order - b.order)
                          .map((option) => (
                            <div 
                              key={option.id} 
                              className={`p-2 rounded border ${
                                option.isCorrect 
                                  ? 'bg-green-50 border-green-200 text-green-800' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option.text}</span>
                                {option.isCorrect && (
                                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Correct
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {question.type === 'TRUE_FALSE' && (
                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-2">Answer:</p>
                      <div className="text-green-600 font-medium">
                        {/* For TRUE_FALSE questions, we'll need to store the correct answer in the options or elsewhere */}
                        True/False question (answer not displayed in preview)
                      </div>
                    </div>
                  )}

                  {question.type === 'SHORT_ANSWER' && (
                    <div>
                      <p className="font-medium text-sm text-gray-700">
                        Short answer question - responses will be manually reviewed
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}