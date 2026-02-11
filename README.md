# Finance App

A comprehensive personal finance management application built with Next.js, featuring bank account integration, transaction tracking, budgeting, goal setting, and AI-powered insights.

## Features

### Core Features

- **Bank Account Integration**: Connect multiple bank accounts via Teller
- **Transaction Management**: Track income, expenses, and transfers
- **Budget Planning**: Create and monitor spending budgets
- **Financial Goals**: Set and track savings goals with milestones
- **Subscription Tracking**: Monitor recurring payments and renewals
- **Category Management**: Organize transactions with custom categories

### AI-Powered Features (Hosted)

- **Transaction Categorization**: Automatically categorize transactions using hosted AI
- **Bulk Categorization**: Categorize multiple transactions at once
- **Financial Insights**: Get AI-generated insights about spending patterns
- **AI Chat**: Chat with an AI assistant about your finances

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Bank Integration**: Teller API
- **State Management**: TanStack Query (React Query)
- **AI**: OpenRouter (Hosted AI models)
- **UI Components**: Shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Teller developer account (for bank integration)
- OpenRouter API key (for hosted AI features)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd finance-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/finance_app"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Teller (for bank integration)
NEXT_PUBLIC_TELLER_APPLICATION_ID="your-teller-application-id"
NEXT_PUBLIC_TELLER_ENV="development"
TELLER_ENV="development"
TELLER_CERT_PATH="/path/to/teller-cert.pem"
TELLER_KEY_PATH="/path/to/teller-key.pem"

# OpenRouter (hosted AI)
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="openrouter/free"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma db push
```

5. **Configure OpenRouter** (for AI features)
   Set `OPENROUTER_API_KEY` in `.env.local` and restart the dev server.

6. **Run the development server**

```bash
npm run dev
```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Quality Checks

Run these commands before opening a pull request:

```bash
npm run lint
npm run format:check
npm run test
```

Husky runs `lint-staged` on pre-commit to enforce linting and formatting.

## AI Setup

The app uses OpenRouter for hosted AI processing.

### Quick Setup

1. Create an API key in OpenRouter and add it to `OPENROUTER_API_KEY`.
2. Optionally set `OPENROUTER_MODEL` (default `openrouter/free`) and `OPENROUTER_BASE_URL`.
3. Restart the dev server. Auto-categorization will run after you sign in.

### Available AI Features

- **Transaction Categorization**: Automatically categorize transactions based on description
- **Bulk Categorization**: Process multiple transactions at once
- **Financial Insights**: Get personalized spending advice
- **AI Chat**: Ask questions about your finances

### Model Selection

Set `OPENROUTER_MODEL` to any OpenRouter model ID. The default is `openrouter/free`.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (authenticated)/   # Protected routes
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── ...               # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── store/                # State management (legacy)
```

## Key Features

### Bank Integration

- Connect multiple bank accounts securely via Teller
- Automatic transaction syncing
- Real-time balance updates
- Credit limit tracking

### Transaction Management

- Manual and automatic transaction entry
- AI-powered categorization
- Bulk operations
- Search and filtering

### Budgeting

- Create budgets by category or period
- Recurring budget support
- Progress tracking
- Spending alerts

### Goals & Milestones

- Set financial goals with target amounts
- Track progress over time
- Milestone achievements
- Visual progress indicators

### AI-Powered Insights

- Hosted AI processing via OpenRouter
- Transaction categorization
- Spending pattern analysis
- Personalized financial advice

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Check the [OLLAMA_SETUP.md](./OLLAMA_SETUP.md) for OpenRouter setup issues
- Review the documentation in the `/docs` folder
- Open an issue on GitHub # personal-finance
