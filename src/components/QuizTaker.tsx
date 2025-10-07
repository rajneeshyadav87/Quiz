'use client'

import { useState } from 'react'

interface Question {
  id: string
  text: string
  type: string
  points: number
  options: QuestionOption[]
}

interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizTakerProps {
  quiz: {
    id: string
    title: string
    description?: string
    timeLimit?: number
    questions: Question[]
  }
  onSubmit: (answers: Record<string, string>) => void
}

export default function QuizTaker({ quiz, onSubmit }: QuizTakerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600">{quiz.description}</p>
        )}
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            {quiz.timeLimit && (
              <span className="text-sm text-gray-500">
                Time Limit: {quiz.timeLimit} minutes
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {question && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {question.text}
          </h2>
          
          <div className="space-y-3">
            {question.type === 'MULTIPLE_CHOICE' && question.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option.text}
                  checked={answers[question.id] === option.text}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span>{option.text}</span>
              </label>
            ))}
            
            {question.type === 'TRUE_FALSE' && (
              <>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value="true"
                    checked={answers[question.id] === 'true'}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span>True</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value="false"
                    checked={answers[question.id] === 'false'}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span>False</span>
                </label>
              </>
            )}
            
            {question.type === 'SHORT_ANSWER' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your answer..."
                rows={3}
              />
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="bg-gray-500 hover:bg-gray-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
        >
          Previous
        </button>
        
        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}