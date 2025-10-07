'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
  order: number
}

interface Question {
  id: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  points: number
  order: number
  options: QuestionOption[]
}

interface Quiz {
  id: string
  title: string
  description?: string
  timeLimit?: number
  isPublished: boolean
  questions: Question[]
}

export default function TakeQuiz() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<{score: number, totalPoints: number, percentage: number} | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`)
        if (response.ok) {
          const data = await response.json()
          if (!data.isPublished) {
            setError('This quiz is not published yet.')
            return
          }
          setQuiz(data)
          // Initialize timer if quiz has time limit
          if (data.timeLimit) {
            setTimeRemaining(data.timeLimit * 60) // Convert minutes to seconds
          }
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

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!quiz || isSubmitting) return

    setIsSubmitting(true)
    try {
      console.log('Submitting quiz with answers:', answers)
      
      // Submit to API
      const response = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Received data:', data)
        setResults({
          score: data.score,
          totalPoints: data.totalPoints,
          percentage: data.percentage
        })
      } else {
        const errorText = await response.text()
        console.error('Submit failed:', errorText)
        alert('Failed to submit quiz: ' + errorText)
      }
      
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('An error occurred while submitting the quiz')
    } finally {
      setIsSubmitting(false)
    }
  }, [quiz, isSubmitting, answers])

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || results) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev !== null && prev <= 1) {
          handleSubmit() // Auto-submit when time runs out
          return 0
        }
        return prev ? prev - 1 : null
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, results, handleSubmit])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Quiz not found'}
          </div>
          <Link href="/quizzes" className="text-blue-600 hover:text-blue-800">
            ← Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            This quiz has no questions yet.
          </div>
          <Link href="/quizzes" className="text-blue-600 hover:text-blue-800">
            ← Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h1>
            <div className={`text-6xl font-bold mb-4 ${
              results.percentage >= 70 ? 'text-green-600' : 
              results.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {results.percentage}%
            </div>
            <p className="text-lg text-gray-700 mb-4">
              You scored <span className="font-bold">{results.score}</span> out of <span className="font-bold">{results.totalPoints}</span> points
            </p>
            <div className="text-sm text-gray-600 mb-6">
              {results.percentage >= 70 && <p className="text-green-600 font-semibold">Excellent work! 🎉</p>}
              {results.percentage >= 50 && results.percentage < 70 && <p className="text-yellow-600 font-semibold">Good job! 👍</p>}
              {results.percentage < 50 && <p className="text-red-600 font-semibold">Keep practicing! 📚</p>}
            </div>
            <div className="space-x-4">
              <Link href="/quizzes">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
                  Back to Quizzes
                </button>
              </Link>
              <Link href="/">
                <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded">
                  Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {timeRemaining !== null && (
              <div className={`text-lg font-semibold ${
                timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'
              }`}>
                Time: {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          
          {quiz.description && (
            <p className="text-gray-600 mb-4">{quiz.description}</p>
          )}
          
          {/* Progress Bar */}
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Question {currentQuestionIndex + 1}
              </h2>
              <span className="text-sm text-gray-500">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-lg text-gray-800">{currentQuestion.text}</p>
          </div>
          
          <div className="space-y-3">
            {/* Multiple Choice */}
            {currentQuestion.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-3">
                {currentQuestion.options
                  .sort((a, b) => a.order - b.order)
                  .map((option) => (
                    <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded border hover:bg-gray-50">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option.text}
                        checked={answers[currentQuestion.id] === option.text}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-800">{option.text}</span>
                    </label>
                  ))
                }
              </div>
            )}
            
            {/* True/False */}
            {currentQuestion.type === 'TRUE_FALSE' && (
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded border hover:bg-gray-50">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value="true"
                    checked={answers[currentQuestion.id] === 'true'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-800">True</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded border hover:bg-gray-50">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value="false"
                    checked={answers[currentQuestion.id] === 'false'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-800">False</span>
                </label>
              </div>
            )}
            
            {/* Short Answer */}
            {currentQuestion.type === 'SHORT_ANSWER' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your answer..."
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-500 hover:bg-gray-700 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded"
          >
            Previous
          </button>
          
          <div className="space-x-4">
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-2 px-6 rounded"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}