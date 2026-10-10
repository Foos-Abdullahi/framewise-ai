# Framewise AI

Framewise AI turns uploaded videos and public YouTube links into concise summaries, searchable timelines, and key insights.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Gemini via `@google/genai`
- Vercel Blob for direct browser uploads
- Zod for request validation

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your credentials:

   ```env
   GEMINI_API_KEY=your_key
   BLOB_READ_WRITE_TOKEN=your_token
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Status

The Next.js foundation and upload/link interface are ready. Blob upload, Gemini analysis, persisted results, and video Q&A are the next implementation milestones.
