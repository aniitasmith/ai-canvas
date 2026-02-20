# Emoji Canvas Generator

A creative web application for generating emoji-style images using AI and composing them on an interactive canvas.

## Features

### AI Image Generation
- Generate cute emoji-style images from text descriptions
- Powered by Hugging Face's FLUX.1-schnell model
- Automatic prompt enhancement for consistent emoji aesthetics

### Interactive Canvas
- **Infinite pan and zoom** - Navigate freely across your canvas
- **Multi-tool support** - Select, pan, draw, add text
- **Shapes** - Add rectangles, circles, and triangles
- **Freehand drawing** - Draw with customizable brush color and size
- **Text tool** - Add text with adjustable color and size
- **Layer management** - Bring forward, send backward, bring to front, send to back

### Editing Features
- **Undo/Redo** - Full history support with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- **Object manipulation** - Move, scale, and rotate any element
- **Object boundaries** - Elements stay within the visible canvas
- **Delete** - Remove selected elements (Delete/Backspace key)
- **Clear all** - Start fresh with one click
- **Export** - Download your creation as PNG

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Canvas**: Fabric.js
- **Styling**: Tailwind CSS
- **AI**: Hugging Face Inference API
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 18+
- Hugging Face account and API token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-canvas.git
cd ai-canvas
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your Hugging Face token to `.env`:
```
HF_TOKEN=your_huggingface_token_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-canvas/
├── app/
│   ├── api/generate/     # AI image generation endpoint
│   ├── page.tsx          # Main application page
│   └── layout.tsx        # App layout
├── components/
│   ├── Canvas.tsx        # Main Fabric.js canvas component
│   ├── PromptInput.tsx   # AI prompt input component
│   ├── ActionBar.tsx     # Bottom action bar
│   ├── icons/            # Centralized SVG icons
│   └── toolbar/          # Toolbar components
│       ├── Toolbar.tsx
│       ├── ToolButton.tsx
│       ├── ShapesMenu.tsx
│       ├── ColorSizeControls.tsx
│       ├── LayerControls.tsx
│       ├── HistoryControls.tsx
│       ├── LoadingOverlay.tsx
│       ├── types.ts
│       └── constants.ts
└── lib/
    └── api-config.ts     # API configuration and utilities
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Y | Redo |
| Ctrl/Cmd + Shift + Z | Redo |
| Delete / Backspace | Delete selected |

## License

MIT
