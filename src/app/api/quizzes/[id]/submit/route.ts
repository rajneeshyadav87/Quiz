import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id
    const body = await request.json()
    const { answers } = body

    // For now, we'll use a dummy user ID - in a real app, this would come from authentication
    const defaultUser = await prisma.user.findFirst({
      where: { email: 'admin@quiz.com' }
    })

    if (!defaultUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true
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

    // Calculate score
    let totalScore = 0
    let totalPoints = 0

    const answerData = []

    console.log('Calculating score for quiz:', quiz.title)
    console.log('User answers:', answers)

    for (const question of quiz.questions) {
      totalPoints += question.points
      const userAnswer = answers[question.id]
      let isCorrect = false
      let points = 0

      console.log(`Question ${question.id}: Type=${question.type}, User Answer="${userAnswer}"`)

      if (question.type === 'MULTIPLE_CHOICE') {
        const correctOption = question.options.find(opt => opt.isCorrect)
        console.log('Correct option:', correctOption)
        console.log('All options:', question.options)
        if (correctOption && userAnswer === correctOption.text) {
          isCorrect = true
          points = question.points
          totalScore += points
          console.log(`✓ Correct! Awarded ${points} points`)
        } else {
          console.log(`✗ Incorrect. Expected: "${correctOption?.text}", Got: "${userAnswer}"`)
        }
      } else if (question.type === 'TRUE_FALSE') {
        // For TRUE_FALSE questions, we'll check if there's a correct option stored
        const correctOption = question.options.find(opt => opt.isCorrect)
        console.log('TRUE_FALSE - Question ID:', question.id)
        console.log('TRUE_FALSE - Correct option:', correctOption)
        console.log('TRUE_FALSE - All options:', question.options.map(opt => ({ id: opt.id, text: opt.text, isCorrect: opt.isCorrect })))
        console.log('TRUE_FALSE - User answer:', `"${userAnswer}"`, typeof userAnswer)
        
        if (correctOption) {
          // If correct option exists, compare with user answer
          console.log('TRUE_FALSE - Comparing:', `"${userAnswer}" === "${correctOption.text}"`)
          if (userAnswer === correctOption.text) {
            isCorrect = true
            points = question.points
            totalScore += points
            console.log(`✓ TRUE_FALSE Correct! Awarded ${points} points`)
          } else {
            console.log(`✗ TRUE_FALSE Incorrect. Expected: "${correctOption.text}", Got: "${userAnswer}"`)
          }
        } else {
          console.log('TRUE_FALSE - No correct option found in database')
          console.log('TRUE_FALSE - Question options breakdown:')
          question.options.forEach((opt, index) => {
            console.log(`  Option ${index}: text="${opt.text}", isCorrect=${opt.isCorrect}`)
          })
        }
      }
      // SHORT_ANSWER questions would need manual grading

      console.log(`Question scored: ${points}/${question.points}`)

      answerData.push({
        questionId: question.id,
        selectedText: userAnswer || '',
        isCorrect,
        points
      })
    }

    console.log(`Final score: ${totalScore}/${totalPoints}`)

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: defaultUser.id,
        quizId: quiz.id,
        score: totalScore,
        totalPoints: totalPoints,
        status: 'COMPLETED',
        completedAt: new Date(),
        answers: {
          create: answerData
        }
      },
      include: {
        answers: true
      }
    })

    const result = {
      attempt,
      score: totalScore,
      totalPoints: totalPoints,
      percentage: totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0
    }

    console.log('Returning result:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error submitting quiz attempt:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 }
    )
  }
}