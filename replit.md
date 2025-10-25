# MindFlow - AI-Powered Stress & Wellness Tracker

## Overview

MindFlow is a next-generation web application that tracks, analyzes, and visualizes user stress levels using health metrics, mood journaling, focus tracking, and AI-powered insights. The application combines Google Fit-style health data, text-based mood reflection, focus session monitoring, and mindfulness activities with Gemini AI analysis to provide personalized stress management recommendations.

The app features a modern, calming interface inspired by wellness apps like Calm and Headspace, with data visualization clarity similar to Apple Health, and conversational AI interface patterns from ChatGPT.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React with Vite**: Fast development server with hot module replacement
- **TypeScript**: Type-safe development across the entire application
- **Wouter**: Lightweight client-side routing for SPA navigation
- **Single Page Application**: Client-side routing with onboarding flow gating

**State Management**
- **TanStack React Query**: Server state management, caching, and data synchronization
- **React Context API**: Client-side state for theme preferences and onboarding status
- **Local Storage**: Persistence for theme settings and onboarding completion flag

**UI Component System**
- **Shadcn UI**: Radix UI primitives with custom styling
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Framer Motion**: Animation library for smooth transitions and micro-interactions
- **Custom Design System**: Typography scale using Inter, Plus Jakarta Sans, and JetBrains Mono fonts with neumorphic design principles

**Data Visualization**
- **Recharts**: Composable chart components for health metrics and stress trends
- **Custom visualizations**: Line charts, area charts, and bar charts for weekly trends and focus statistics

### Backend Architecture

**Server Framework**
- **Express.js**: RESTful API server with JSON middleware
- **TypeScript**: Type-safe backend development
- **Node.js with ESM**: Modern module system for cleaner imports

**API Design Pattern**
- **RESTful endpoints**: Resource-based URL structure (`/api/health-metrics`, `/api/mood-entries`, etc.)
- **CRUD operations**: Standard HTTP methods for data manipulation
- **Zod validation**: Runtime schema validation for API inputs using `drizzle-zod`

**Database Layer**
- **Drizzle ORM**: Type-safe database queries with schema-first approach
- **PostgreSQL**: Relational database for structured health and mood data
- **Neon Serverless**: PostgreSQL provider configured via `@neondatabase/serverless`
- **Schema-driven development**: Centralized schema definitions in `shared/schema.ts`

**Data Models**
- **Users**: Authentication and user identity
- **Health Metrics**: Steps, heart rate, sleep hours, active minutes (simulated Google Fit data)
- **Mood Entries**: Journal entries with AI-analyzed sentiment and stress levels
- **Focus Sessions**: Time tracking with productive vs. distracted time
- **Chat Messages**: Conversational history with AI assistant
- **Mindfulness Activities**: Generated wellness exercises with completion tracking
- **User Settings**: Notification and feature preferences

### AI Integration

**Gemini API Integration**
- **Google GenAI SDK**: `@google/genai` for Gemini 2.5 Pro model access
- **Sentiment Analysis**: 1-5 star rating with confidence scores for mood journal entries
- **Stress Level Analysis**: Comprehensive analysis combining health metrics, mood patterns, and focus data
- **Conversational AI**: Context-aware chat responses for wellness guidance
- **Mindfulness Generation**: AI-generated breathing exercises, meditation prompts, and stress relief activities
- **Structured JSON responses**: Type-safe AI outputs using response schemas

**AI Features**
- Multi-modal stress analysis considering physical health, emotional state, and productivity
- Personalized recommendations based on user patterns
- Real-time chat interface with message history
- Automatic sentiment detection on journal entries

### Authentication & Session Management

**Current Implementation**
- User schema defined but authentication not fully implemented
- Session storage configured with `connect-pg-simple` for PostgreSQL-backed sessions
- Express session middleware prepared in server setup

### Development & Build

**Development Environment**
- **Vite Dev Server**: Fast HMR with middleware mode for Express integration
- **Replit Integration**: Custom error overlay and development banner plugins
- **TypeScript Compiler**: Strict mode with path aliases for clean imports

**Build Process**
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js` as ESM
- **Deployment**: Production mode serves built static files from Express

**Path Aliases**
- `@/*`: Client source files
- `@shared/*`: Shared schemas and types between client and server
- `@assets/*`: Static assets directory

### Design System

**Theme System**
- **Dark/Light modes**: CSS custom properties with class-based theming
- **Color tokens**: HSL-based color system with alpha channel support
- **Component variants**: Consistent styling patterns across all UI components
- **Accessibility**: Focus states, ARIA labels, and keyboard navigation support

**Layout Principles**
- Responsive grid system with breakpoints for mobile/tablet/desktop
- Consistent spacing primitives using Tailwind's spacing scale
- Card-based component architecture with elevation and borders
- Maximum content width constraints for optimal readability

## External Dependencies

### Third-Party Services

**AI & Machine Learning**
- **Google Gemini API**: Primary AI service for sentiment analysis, stress level detection, chat conversations, and mindfulness activity generation
- API Key: Configured via `GEMINI_API_KEY` environment variable
- Model: `gemini-2.5-pro` for advanced reasoning and structured outputs

**Database**
- **Neon PostgreSQL**: Serverless PostgreSQL database provider
- Connection: Via `DATABASE_URL` environment variable
- Features: Automatic scaling, connection pooling, and serverless architecture

### Key NPM Dependencies

**Frontend Core**
- `react` & `react-dom`: UI framework
- `wouter`: Client-side routing
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation library
- `recharts`: Chart visualization

**UI Components**
- `@radix-ui/*`: Headless accessible components (40+ packages)
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Component variant management
- `cmdk`: Command palette component

**Backend Core**
- `express`: Web server framework
- `drizzle-orm`: Database ORM
- `@neondatabase/serverless`: PostgreSQL driver
- `@google/genai`: Gemini AI SDK

**Validation & Forms**
- `zod`: Schema validation
- `drizzle-zod`: Drizzle to Zod schema conversion
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Form validation resolvers

**Utilities**
- `date-fns`: Date manipulation and formatting
- `clsx` & `tailwind-merge`: Conditional class name utilities
- `nanoid`: Unique ID generation

### Font Dependencies
- **Google Fonts**: Inter, Plus Jakarta Sans, JetBrains Mono loaded via CDN in `index.html`