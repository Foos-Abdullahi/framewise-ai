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





## Vercel deployment

Connect the GitHub repository `Foos-Abdullahi/framewise-ai` and select the `dev` branch for production, which contains the application.
Use Next.js framework detection, the default build command (`npm run build`), and Node.js 22 or newer.

Configure `OPENROUTER_API_KEY` as a secret and `OPENROUTER_MODEL=google/gemini-3.8-flash` for Production and Preview.
Create a **private** Vercel Blob store connected to this project; include Production, Preview, and Development if you need local Blob testing.
The connection provides `BLOB_READ_WRITE_TOKEN`. Keep this token on the server, without a `NEXT_PUBLIC_` prefix.

Browser uploads go directly to private Blob storage and are limited to 20 MB. The analyzer reads only the current browser's signed upload session and deletes the temporary video after analysis (including failed analysis).
Local development continues to accept direct file uploads when Blob is not configured. Hosted uploads require Blob to avoid Vercel's function request-size limit.
The analysis route allows up to 300 seconds; Fluid Compute should remain enabled.
