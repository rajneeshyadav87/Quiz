'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Question {
  text: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  points: number
  options: string[]
  correctAnswers: string[]
}

export default function CreateQuiz() {
  const router = useRouter()
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    timeLimit: ''
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: '',
    type: 'MULTIPLE_CHOICE',
    points: 1,
    options: ['', '', '', ''],
    correctAnswers: []
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setQuiz(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleQuestionChange = (field: string, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index] = value
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const handleCorrectAnswerToggle = (option: string) => {
    const isSelected = currentQuestion.correctAnswers.includes(option)
    let newCorrectAnswers
    
    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      // For multiple choice, only one correct answer
      newCorrectAnswers = isSelected ? [] : [option]
    } else {
      // For other types, multiple correct answers possible
      newCorrectAnswers = isSelected 
        ? currentQuestion.correctAnswers.filter(a => a !== option)
        : [...currentQuestion.correctAnswers, option]
    }
    
    setCurrentQuestion(prev => ({
      ...prev,
      correctAnswers: newCorrectAnswers
    }))
  }

  const addQuestion = () => {
    if (currentQuestion.text.trim()) {
      setQuestions(prev => [...prev, { ...currentQuestion }])
      setCurrentQuestion({
        text: '',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        options: ['', '', '', ''],
        correctAnswers: []
      })
    }
  }

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!quiz.title.trim() || questions.length === 0) {
      alert('Please provide a quiz title and at least one question.')
      return
    }

    setIsLoading(true)
    try {
      // For now, we'll use a dummy user ID - in a real app, this would come from authentication
      const quizData = {
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit ? parseInt(quiz.timeLimit) : null,
        creatorId: 'dummy-user-id', // This should come from your auth system
        questions: questions.map((q, index) => ({
          text: q.text,
          type: q.type,
          points: q.points,
          order: index + 1,
          options: q.type === 'MULTIPLE_CHOICE' ? q.options.filter(opt => opt.trim()) : [],
          correctAnswers: q.correctAnswers // This was missing!
        }))
      }

      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      })

      if (response.ok) {
        alert('Quiz created successfully!')
        router.push('/quizzes')
      } else {
        const error = await response.text()
        alert(`Failed to create quiz: ${error}`)
      }
    } catch (error) {
      console.error('Error creating quiz:', error)
      alert('An error occurred while creating the quiz.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
        </div>

        {/* Quiz Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                name="title"
                value={quiz.title}
                onChange={handleQuizChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={quiz.description}
                onChange={handleQuizChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={quiz.timeLimit}
                onChange={handleQuizChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for no time limit"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Add Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Question</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Text *
              </label>
              <textarea
                value={currentQuestion.text}
                onChange={(e) => handleQuestionChange('text', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your question"
                rows={2}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => handleQuestionChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            {/* Options for Multiple Choice */}
            {currentQuestion.type === 'MULTIPLE_CHOICE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options (check the correct answer)
                </label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswers.includes(option)}
                        onChange={() => handleCorrectAnswerToggle(option)}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* True/False Options */}
            {currentQuestion.type === 'TRUE_FALSE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="trueFalseAnswer"
                      checked={currentQuestion.correctAnswers.includes('true')}
                      onChange={() => handleCorrectAnswerToggle('true')}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="trueFalseAnswer"
                      checked={currentQuestion.correctAnswers.includes('false')}
                      onChange={() => handleCorrectAnswerToggle('false')}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}

            <button
              onClick={addQuestion}
              disabled={!currentQuestion.text.trim()}
              className="bg-green-500 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
            >
              Add Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Questions ({questions.length})</h2>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">Question {index + 1}</h3>
                      <p className="text-gray-700 mt-1">{question.text}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        Type: {question.type.replace('_', ' ')} | Points: {question.points}
                      </div>
                      {question.type === 'MULTIPLE_CHOICE' && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Options:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
                            {question.options.filter(opt => opt.trim()).map((option, optIndex) => (
                              <li key={optIndex} className={question.correctAnswers.includes(option) ? 'font-semibold text-green-600' : ''}>
                                {option} {question.correctAnswers.includes(option) && '(Correct)'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {question.type === 'TRUE_FALSE' && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Correct Answer: <span className="font-semibold text-green-600">
                              {question.correctAnswers[0] === 'true' ? 'True' : 'False'}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link href="/">
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded">
              Cancel
            </button>
          </Link>
          <button
            onClick={handleSubmit}
            disabled={!quiz.title.trim() || questions.length === 0 || isLoading}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded"
          >
            {isLoading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}