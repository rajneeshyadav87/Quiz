# Quiz Management System

A comprehensive quiz management system built with **Next.js**, **PostgreSQL**, and **Prisma ORM**.

## Features

- **User Authentication**: Secure user registration and login
- **Quiz Creation**: Create and manage quizzes with multiple question types
- **Question Types**: Support for multiple choice, true/false, and short answer questions
- **Quiz Taking**: Interactive quiz-taking interface with progress tracking
- **Results Tracking**: Comprehensive scoring and results analytics
- **Role-based Access**: Different permissions for admins, teachers, and students
- **Time Limits**: Optional time limits for quizzes
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Clone the repository** (if applicable) or use the current directory
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your database connection string and other configurations.

4. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push the schema to your database
   npm run db:push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Database Schema

The system includes the following main entities:

- **Users**: Manage user accounts with role-based access (Admin, Teacher, Student)
- **Quizzes**: Store quiz information including title, description, and settings
- **Questions**: Support multiple question types with configurable scoring
- **Question Options**: Multiple choice options with correct answer marking
- **Quiz Attempts**: Track user quiz attempts and completion status
- **Answers**: Store user responses and scoring information

## API Endpoints

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create a new quiz
- `GET /api/quizzes/[id]` - Get a specific quiz
- `PUT /api/quizzes/[id]` - Update a quiz
- `DELETE /api/quizzes/[id]` - Delete a quiz

### Questions
- `GET /api/quizzes/[id]/questions` - Get questions for a quiz
- `POST /api/quizzes/[id]/questions` - Add a question to a quiz

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/               # Utility functions and configurations
└── types/             # TypeScript type definitions
```

## Development Notes

1. **Database Setup**: Ensure PostgreSQL is running and accessible
2. **Environment Variables**: Configure all required environment variables before starting
3. **Prisma Studio**: Use `npm run db:studio` to manage database records visually
4. **Type Safety**: The project uses TypeScript for enhanced development experience

## Next Steps

1. Install dependencies: `npm install`
2. Configure your PostgreSQL database connection
3. Run database setup commands
4. Start the development server
5. Begin customizing the application for your specific needs

## Contributing

This is a foundation for a quiz management system. Feel free to extend and customize it according to your requirements.