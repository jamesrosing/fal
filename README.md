# Image Background Remover

A web application that removes backgrounds from images using Fal AI's background removal API.

## Features

- Upload and process images
- Remove backgrounds automatically
- Download processed images
- Full-screen image preview
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Fal AI API
- Vercel Blob Storage

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   FAL_KEY=your_fal_ai_key
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is configured for deployment on Vercel. Make sure to add the environment variables in your Vercel project settings.
