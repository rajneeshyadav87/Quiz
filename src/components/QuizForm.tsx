'use client'

import { useState } from 'react'

interface QuizFormProps {
  onSubmit: (data: QuizFormData) => void
  initialData?: Partial<QuizFormData>
  isLoading?: boolean
}

export interface QuizFormData {
  title: string
  description: string
  timeLimit: number | null
}

export default function QuizForm({ onSubmit, initialData, isLoading }: QuizFormProps) {
  const [formData, setFormData] = useState<QuizFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    timeLimit: initialData?.timeLimit || null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timeLimit' ? (value ? parseInt(value) : null) : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Quiz Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter quiz title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter quiz description"
        />
      </div>

      <div>
        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">
          Time Limit (minutes)
        </label>
        <input
          type="number"
          id="timeLimit"
          name="timeLimit"
          value={formData.timeLimit || ''}
          onChange={handleChange}
          min="1"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Leave empty for no time limit"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isLoading ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
    </form>
  )
}