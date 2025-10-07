import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to ensure we have a default user
async function ensureDefaultUser() {
  let user = await prisma.user.findFirst({
    where: { email: 'admin@quiz.com' }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@quiz.com',
        name: 'Admin User',
        password: 'hashed_password', // In a real app, this should be properly hashed
        role: 'ADMIN'
      }
    })
  }
  
  return user
}

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            questions: true,
            quizAttempts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, timeLimit, questions } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Ensure we have a default user
    const defaultUser = await ensureDefaultUser()

    // Create quiz with questions in a transaction
    const quiz = await prisma.$transaction(async (tx) => {
      // Create the quiz
      const newQuiz = await tx.quiz.create({
        data: {
          title,
          description,
          timeLimit,
          creatorId: defaultUser.id
        }
      })

      // Create questions if provided
      if (questions && questions.length > 0) {
        for (const question of questions) {
          const createdQuestion = await tx.question.create({
            data: {
              text: question.text,
              type: question.type,
              points: question.points || 1,
              order: question.order,
              quizId: newQuiz.id
            }
          })

          // Create options for multiple choice and true/false questions
          if (question.type === 'MULTIPLE_CHOICE' && question.options) {
            for (let i = 0; i < question.options.length; i++) {
              const option = question.options[i]
              if (option.trim()) {
                await tx.questionOption.create({
                  data: {
                    text: option,
                    isCorrect: question.correctAnswers?.includes(option) || false,
                    order: i + 1,
                    questionId: createdQuestion.id
                  }
                })
              }
            }
          } else if (question.type === 'TRUE_FALSE' && question.correctAnswers && question.correctAnswers.length > 0) {
            // Create True and False options for TRUE_FALSE questions
            console.log(`Creating TRUE_FALSE question: "${question.text}"`)
            console.log(`Correct answers: ${JSON.stringify(question.correctAnswers)}`)
            
            await tx.questionOption.create({
              data: {
                text: 'true',
                isCorrect: question.correctAnswers.includes('true'),
                order: 1,
                questionId: createdQuestion.id
              }
            })
            await tx.questionOption.create({
              data: {
                text: 'false',
                isCorrect: question.correctAnswers.includes('false'),
                order: 2,
                questionId: createdQuestion.id
              }
            })
            
            console.log(`TRUE option isCorrect: ${question.correctAnswers.includes('true')}`)
            console.log(`FALSE option isCorrect: ${question.correctAnswers.includes('false')}`)
          }
        }
      }

      return newQuiz
    })

    // Fetch the complete quiz with relations
    const completeQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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

    return NextResponse.json(completeQuiz, { status: 201 })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    )
  }
}