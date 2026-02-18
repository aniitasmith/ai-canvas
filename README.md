# AI Canvas

Generate stunning images with AI. Enter a text prompt and create visuals instantly using Stable Diffusion XL.

## Features

- **Text-to-Image** - Describe what you want to see
- **SDXL Model** - High-quality image generation via Replicate
- **Download** - Save generated images directly
- **Real-time Status** - See generation progress

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Replicate API (SDXL)

## Getting Started

1. Get your API token from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

2. Create a `.env` file:
```
REPLICATE_API_TOKEN=your_token_here
```

3. Install and run:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Live Demo

[ai-canvas-seven.vercel.app](https://ai-canvas-seven.vercel.app)

> Note: The live demo requires a valid Replicate API token configured in Vercel environment variables.
