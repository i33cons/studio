# DocFlow: AI Agent Guidelines

**Project**: Firebase Studio - DocFlow  
**Type**: Next.js 15 PDF manipulation tool with AI-powered OCR  
**Stack**: React 19, TypeScript, Tailwind CSS, Radix UI, Genkit AI, pdf-lib, pdfjs-dist

---

## Quick Start

| Task | Command | Notes |
|------|---------|-------|
| **Dev server** | `npm run dev` | Port 9002, Turbopack enabled |
| **Genkit AI UI** | `npm run genkit:dev` | Separate terminal; browse AI flows/prompts |
| **Build** | `npm run build` | Sets `NODE_ENV=production` |
| **Type check** | `npm run typecheck` | `tsc --noEmit` |
| **Lint** | `npm run lint` | Next.js linter |

---

## Architecture Overview

### File Structure
```
src/
├── app/              # Next.js app router (layout.tsx, page.tsx)
├── ai/               # Genkit AI flows
│   ├── genkit.ts     # AI instance config (googleAI, gemini-2.5-flash)
│   └── flows/        # AI workflow definitions (Zod schemas, server actions)
├── components/
│   ├── docflow/      # Domain: Dashboard, DocumentWorkspace, FileDropzone, OcrModal, etc.
│   ├── ui/           # Radix UI primitives (unstyled, Tailwind styled)
│   └── icons/        # Branded icons
├── hooks/            # React hooks (use-toast, use-mobile)
├── lib/              # Utilities (pdf-utils.ts, utils.ts)
└── types/            # TypeScript types (index.ts)
```

### Technology Decisions
- **Framework**: Next.js 15.5 (app router, server actions, no API routes)
- **UI Components**: Radix UI (headless) + Tailwind CSS + class-variance-authority (CVA)
- **PDF Processing**: `pdf-lib` (manipulation) + `pdfjs-dist` (rendering thumbnails)
- **AI**: Genkit with Google Generative AI (gemini-2.5-flash)
- **Styling**: Tailwind with CSS variables (HSL tokens in globals.css)
- **Build**: Turbopack (dev), standard Next.js build (prod)
- **Data**: Client-side state (React useState), no backend database yet

---

## Key Patterns & Conventions

### 1. Component Structure
All UI components follow the **Radix UI + Tailwind pattern**:
```tsx
// Example: Button component
import { buttonVariants } from "@/components/ui/button"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap",
  {
    variants: {
      variant: { default: "bg-primary", outline: "border border-input" },
      size: { default: "h-10 px-4", sm: "h-9 px-3" },
    },
  }
)
```
- Use `cn()` function (clsx + tailwind-merge) to combine classNames safely
- Extract button variants for non-button uses (links, divs)
- All UI components in `src/components/ui/` should be unstyled Radix primitives

### 2. Genkit AI Flows
Pattern for server-side AI operations:
```tsx
// src/ai/flows/example.ts
import { z } from "zod"

export const exampleFlow = ai.defineFlow({
  name: "example",
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ result: z.string() }),
})

export const exampleAction = flow(exampleFlow, async (input) => {
  // Server action logic
  return { result: "..." }
})
```
- Define **input/output schemas with Zod** for type safety
- Mark with `'use server'` for secure API communication
- Use `ai.definePrompt()` for prompt templates with variables
- Genkit model accepts multi-modal input (images, PDFs as data URIs)

### 3. State Management
- **React useState** for local component state (documents, pages, UI state)
- Document model: `{ id, name, file, pdfLibDoc, pages[] }`
- Page model: `{ id, pageIndex, rotation, thumbnailUrl }`
- Toast notifications via custom `useToast()` hook

### 4. PDF Processing
- **pdf-lib**: Programmatic PDF manipulation (rotate, delete, reorder, merge)
- **pdfjs-dist**: Rendering pages to Canvas for thumbnails
- Utilities in `lib/pdf-utils.ts` wrap library calls
- Store processed PDFs in React state (avoid large file I/O)

### 5. Styling Conventions
- **Tailwind utilities** for layout and responsive design
- **CSS variables** in `globals.css` for theme colors (background, foreground, primary, muted, accent, destructive)
- **Font families**: `body` (Inter), `heading` (Space Grotesk), `mono` (monospace)
- **Dark mode**: Supported via Tailwind class strategy
- **Design system**: See [docs/blueprint.md](docs/blueprint.md) for brand colors, typography, animations

### 6. TypeScript Configuration
- **Strict mode** enabled (`"strict": true`)
- **Path alias**: `@/*` maps to `./src/*` for clean imports
- **Target**: ES2017 (supports modern async/await, Promise, etc.)
- Always use TypeScript for `.ts` / `.tsx` files; no JavaScript

---

## Common Development Tasks

### Adding a New UI Component
1. Create file in `src/components/ui/[component].tsx`
2. Wrap Radix primitive with Tailwind + CVA for styling
3. Export component and variants (for composability)
4. Example: See `button.tsx`, `dialog.tsx`, `card.tsx`

### Creating a New AI Flow
1. Create file in `src/ai/flows/[flow-name].ts`
2. Define Zod schemas for input/output
3. Create `ai.defineFlow()` with prompt template
4. Export server action (mark with `'use server'`)
5. Import and call from components or other flows

### Adding a PDF Feature
1. Create utility function in `src/lib/pdf-utils.ts`
2. Handle file I/O with `pdf-lib` or `pdfjs-dist`
3. Expose hook or component that wraps the utility
4. Test with sample PDFs in development

### Modifying Styling/Theme
1. Update CSS variables in `src/app/globals.css` (HSL colors)
2. Or update `tailwind.config.ts` for structural changes (fonts, sizes)
3. CVA variants in component files control mode variants (dark mode, sizes)

---

## Development Environment Setup

### Fonts
- **Inter** (body): Bundled via Next.js font optimization
- **Space Grotesk** (headlines): Bundled via Next.js font optimization
- Imported in `src/app/layout.tsx`, applied via Tailwind theme

### Port Configuration
- **Next.js dev**: `http://localhost:9002` (via `--turbopack -p 9002`)
- **Genkit UI**: Default port (check terminal output after `npm run genkit:dev`)

### Remote Images (Allowed)
- `placehold.co`, `unsplash.com`, `picsum.photos`
- Configured in `next.config.ts` (domain list)
- Use with `<Image>` component from Next.js

---

## Build & Deployment

### Development
- Uses **Turbopack** for fast HMR and bundling
- `npm run dev` starts server with hot reload
- Run `npm run genkit:dev` in parallel for AI flow development

### Production
- `npm run build` creates optimized bundle
- `NODE_ENV=production` automatically set
- Deploys to **Firebase Studio** (infrastructure layer)
- App is **client-side rendered** (no server endpoints)

### Configuration Overrides
- `next.config.ts` ignores TypeScript and lint errors in build (dev-friendly)
- Post-build hooks for custom optimization possible

---

## Common Pitfalls & Tips

1. **PDF State Size**: Large PDF files in state can slow React. Use references or lazy load thumbnails.
2. **Genkit Server Actions**: Must be in separate `.ts` files with `'use server'` directive.
3. **Component Re-renders**: Memoize expensive components (thumbnails, canvases) if performance issues arise.
4. **Tailwind Conflicts**: Use `cn()` function to safely merge custom classes without conflicts.
5. **Modal/Dialog Focus**: Radix UI handles focus trapping; ensure proper nesting.
6. **Firebase Integration**: Package is installed but not used; plan backend integration for document storage.

---

## Design System Reference

See [docs/blueprint.md](docs/blueprint.md) for:
- **Colors**: Primary (Indigo #481CA8), Background (Lavender #F3F0FA), Accent (Sapphire #1A70FF)
- **Typography**: Space Grotesk (headlines), Inter (body)
- **Layout**: Multi-panel with central PDF canvas, sidebar toolbar
- **Animations**: Subtle, quick micro-interactions for file uploads, transitions
- **Icons**: Clean, minimalist, directly represent functions

---

## Useful Imports & Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `cn()` | `src/lib/utils.ts` | Safe className composition |
| `useToast()` | `src/hooks/use-toast.ts` | Toast notifications |
| `pdf-utils` | `src/lib/pdf-utils.ts` | PDF manipulation helpers |
| `buttonVariants` | `src/components/ui/button.tsx` | Button styling variants |
| Radix components | `src/components/ui/*.tsx` | 35+ unstyled UI primitives |
| `ai` | `src/ai/genkit.ts` | Genkit instance (use in flows) |

---

## Getting Help

- **Architecture questions**: Check component source in `src/components/`
- **AI flow examples**: See `src/ai/flows/extract-pdf-text-with-ocr.ts`
- **UI component patterns**: Inspect similar components in `src/components/ui/`
- **Design guidance**: Reference [docs/blueprint.md](docs/blueprint.md)
- **Build issues**: Check `next.config.ts` and `tsconfig.json` for overrides
