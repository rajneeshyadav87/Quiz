import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id

    // Get the quiz with questions and options
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Get all attempts for this quiz
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        answers: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    return NextResponse.json({
      quiz,
      attempts,
      summary: {
        totalQuestions: quiz.questions.length,
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        totalAttempts: attempts.length,
        averageScore: attempts.length > 0 
          ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length 
          : 0
      }
    })

  } catch (error) {
    console.error('Error fetching quiz debug info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz debug info' },
      { status: 500 }
    )
  }
}