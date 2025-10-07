import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        quizId: params.id
      },
      include: {
        options: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { text, type, points, options } = body

    if (!text || !type) {
      return NextResponse.json(
        { error: 'Text and type are required' },
        { status: 400 }
      )
    }

    // Get the next order number
    const lastQuestion = await prisma.question.findFirst({
      where: { quizId: params.id },
      orderBy: { order: 'desc' }
    })

    const order = (lastQuestion?.order || 0) + 1

    const question = await prisma.question.create({
      data: {
        text,
        type,
        points: points || 1,
        order,
        quizId: params.id,
        options: {
          create: options?.map((option: any, index: number) => ({
            text: option.text,
            isCorrect: option.isCorrect || false,
            order: index + 1
          })) || []
        }
      },
      include: {
        options: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}