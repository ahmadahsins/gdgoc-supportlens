# SupportLens - Frontend

AI-powered customer support platform frontend built with Next.js, TypeScript, and Firebase.

## Features

- 🔐 **Firebase Authentication** - Google Sign-in
- 📊 **Analytics Dashboard** - Visualize ticket metrics with Recharts
- 💬 **Unified Inbox** - Manage all support tickets in one place
- 🎫 **Ticket Workspace** - AI-powered draft generation and summarization
- 📝 **Demo Chat** - Customer simulation page for testing
- 📚 **Knowledge Base** - Upload documents with drag & drop
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

## Prerequisites

- Node.js 20+ and npm
- Firebase project with Google Authentication enabled
- Backend server running (see `/server` directory)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   
   Copy `.env.local` and update with your Firebase credentials:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
client/
├── app/                    # Next.js App Router pages
│   ├── analytics/         # Analytics dashboard
│   ├── dashboard/         # Unified inbox
│   ├── demo-chat/         # Customer simulation
│   ├── login/             # Login page
│   ├── settings/kb/       # Knowledge base upload
│   └── tickets/[id]/      # Ticket workspace
├── components/            # React components
│   ├── ui/               # shadcn UI components
│   └── DashboardLayout.tsx
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
└── lib/                  # Utility libraries
    ├── api.ts            # API client
    ├── firebase.ts       # Firebase configuration
    └── utils.ts          # Utility functions
```

## Pages Overview

### Public Pages

- **`/login`** - Google Sign-in authentication
- **`/demo-chat`** - Customer simulation form to create tickets

### Protected Pages (Requires Authentication)

- **`/dashboard`** - Unified inbox with ticket list and filters
- **`/tickets/[id]`** - Individual ticket workspace with:
  - Chat history
  - AI-powered draft generation
  - Ticket summarization
  - Reply functionality
- **`/analytics`** - Analytics dashboard with:
  - Key metrics cards
  - Daily tickets trend chart
  - Sentiment distribution chart
  - Priority distribution chart
  - Category statistics
- **`/settings/kb`** - Knowledge base management with:
  - Drag & drop file upload
  - Document list with status
  - File management (delete)

## API Integration

The frontend communicates with the backend through the API client (`lib/api.ts`):

- `POST /auth/sync` - Sync user data
- `POST /tickets` - Create ticket
- `GET /tickets` - List tickets with filters
- `GET /tickets/:id` - Get ticket details
- `POST /tickets/:id/reply` - Reply to ticket
- `POST /tickets/:id/summarize` - Generate AI summary
- `POST /tickets/:id/generate-draft` - Generate AI draft response
- `POST /knowledge-base/upload` - Upload knowledge document
- `GET /knowledge-base` - List knowledge documents
- `DELETE /knowledge-base/:id` - Delete document
- `GET /analytics/stats` - Get analytics data

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Authentication Flow

1. User visits the app (redirected to `/login` if not authenticated)
2. User clicks "Sign in with Google"
3. Firebase handles Google OAuth flow
4. Upon successful authentication:
   - User data synced with backend (`POST /auth/sync`)
   - User redirected to `/dashboard`
5. Auth token automatically attached to all API requests

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)

## Troubleshooting

### Firebase Authentication Issues

- Ensure Firebase project is properly configured
- Check that Google Sign-in is enabled in Firebase Console
- Verify environment variables are set correctly

### API Connection Issues

- Ensure backend server is running
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- Verify CORS is enabled on backend

### Build Issues

- Clear `.next` folder and rebuild
- Ensure all dependencies are installed
- Check for TypeScript errors

## Additional Notes

- The app uses the Next.js App Router (not Pages Router)
- All components use TypeScript for type safety
- Styling is done with Tailwind CSS v4
- UI components follow shadcn/ui patterns
- Authentication persists across page refreshes via Firebase

