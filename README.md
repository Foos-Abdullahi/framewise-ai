# Framewise AI

Framewise AI turns uploaded videos and public YouTube links into concise summaries, searchable timelines, and key insights.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Gemini via the OpenRouter API
- Direct uploads for videos up to 20 MB
- Zod for request validation

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your credentials:

   ```env
   OPENROUTER_API_KEY=your_openrouter_key
   OPENROUTER_MODEL=google/gemini-3.8-flash
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Status

Uploaded MP4, MOV, and WebM videos (up to 20 MB) and public YouTube video links are analyzed by Gemini through OpenRouter. YouTube links use Google AI Studio; uploads are sent as encoded video data. OpenRouter credits are required. Results include a summary, timeline, entities, and insights. Set your actual OPENROUTER_API_KEY and OPENROUTER_MODEL in .env or .env.local and restart the server to enable analysis. The header theme button switches between light and dark modes and remembers your preference. Enter an optional search question before analyzing to find situations, actions, or topics with timestamps. YouTube and uploaded videos play inside a visual Moment Finder workspace. Click a returned timestamp card or timeline marker to jump to that moment. The scan display shows elapsed request time; the provider does not expose live frame progress. Detailed reports are collapsed by default. Change the question and analyze again to search the same video. Persisted results are a future milestone.




