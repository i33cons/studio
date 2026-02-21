# DocFlow - PDF Documents Management & OCR

A modern web application built with **Next.js 15** (TypeScript) for managing PDF documents with client-side OCR capabilities. Deployed on **Firebase Hosting** as a static web app.

## Features

✅ **Document Management**
- Upload and manage multiple PDF files
- Drag-and-drop file upload interface
- File list with preview thumbnails
- Document workspace for viewing and organizing files

✅ **Client-Side OCR (Optical Character Recognition)**
- Extract text from PDF pages using Tesseract.js (100% client-side, no server required)
- Supports multi-page PDFs
- Lazy-loaded OCR libraries to minimize bundle size
- Real-time text extraction with progress feedback

✅ **UI Components**
- Modern, responsive design using Tailwind CSS
- Radix UI components for accessibility
- Charts and data visualization (Recharts)
- Toast notifications for user feedback
- Dialog modals and tabs for organized workflows

✅ **Static Export & Firebase Hosting**
- Built as static site (output: 'export' in Next.js config)
- Deployable to Firebase Hosting without server overhead
- Version indicator (V.1.0.0) in header

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **OCR:** Tesseract.js (browser-based)
- **PDF Processing:** PDF.js
- **UI Libraries:** Lucide React icons, Embla Carousel
- **Forms:** React Hook Form + Zod validation
- **Networking:** Firebase SDK
- **Hosting:** Firebase Hosting (static)

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase CLI (for deployment)

## Getting Started

### 1. Install Dependencies

```bash
cd studio
npm install
```

### 2. Development Server

Run the development server with hot-reload:

```bash
npm run dev
```

The app will be available at **http://localhost:9002**

### 3. Build for Production

Generate a static export optimized for Firebase Hosting:

```bash
npm run build:export
```

This creates an `out/` directory with all static assets.

### 4. Run with Debugger (VS Code)

Create a `.vscode/launch.json` file in the project root:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js Dev with Debugger",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/studio/node_modules/.bin/next",
      "args": ["dev", "-p", "9002"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "cwd": "${workspaceFolder}/studio"
    }
  ]
}
```

Then:
1. Open VS Code
2. Press `F5` or go to **Run → Start Debugging**
3. Select "Next.js Dev with Debugger"
4. Set breakpoints in your code (click line number in editor)
5. Navigate the app to hit breakpoints

### 5. Deploy to Firebase Hosting

```bash
# Build first
npm run build:export

# Login to Firebase (if not already logged in)
firebase login

# Deploy to hosting
firebase deploy --only hosting
```

The app will be live at your Firebase Hosting URL.

## Project Structure

```
studio/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── docflow/              # Document flow components
│   │   │   ├── Header.tsx        # App header with version
│   │   │   ├── DocflowDashboard.tsx
│   │   │   ├── OcrModal.tsx      # OCR extraction modal
│   │   │   └── ...
│   │   └── ui/                   # Reusable UI components
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── pdf-utils.ts
│   └── types/
│       └── index.ts
├── firebase.json                 # Firebase Hosting config
├── .firebaserc                   # Firebase project config
├── next.config.ts               # Next.js config (output: 'export')
├── package.json
└── tsconfig.json
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 9002) |
| `npm run build:export` | Build static export for production |
| `npm run build` | Build Next.js project |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type check with TypeScript |
| `firebase deploy --only hosting` | Deploy to Firebase Hosting |

## Environment Variables

Currently, no environment variables are required for basic functionality. For future API integrations, add a `.env.local` file:

```env
# Example for future Google AI integration
NEXT_PUBLIC_GOOGLE_API_KEY=your_key_here
```

## How to Use the App

1. **Upload PDFs:** Use the drag-and-drop zone or file picker to upload PDF documents
2. **View Documents:** Browse uploaded files in the document list
3. **Extract Text (OCR):** 
   - Click the "Extract Text (OCR)" button
   - Select a PDF file from the dropdown
   - Click "Extract Text" to process the document
   - Extracted text will appear below for viewing/copying
4. **Manage Files:** See file details and organize your documents in the workspace

## Performance Notes

- OCR processing happens entirely in the browser (client-side)
- First OCR run may take longer as Tesseract.js loads (~2-3 seconds)
- Processing time depends on PDF size and complexity
- Static deployment means zero server costs for hosting

## Future Enhancements

- [ ] Server-side OCR for faster processing (Cloud Run / Firebase Functions)
- [ ] PDF annotations and markup tools
- [ ] Document export (plain text, Word, etc.)
- [ ] Advanced search and filtering
- [ ] User authentication and cloud storage
- [ ] Batch OCR processing

## Troubleshooting

**OCR not working?**
- Check browser console (F12) for errors
- Ensure PDF.js and Tesseract.js CDN are accessible
- Try a different PDF file

**Build fails?**
- Clear cache: `rm -rf .next out`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (should be 18+)

**Firebase deploy fails?**
- Run `firebase login` to re-authenticate
- Run `firebase init hosting` to reconfigure
- Check `.firebaserc` has correct project ID

## License

MIT

## Contact & Support

For issues or questions, please open an issue in the repository.

---

**Current Version:** V.1.0.0  
**Last Updated:** February 2026  
**Deployment:** Firebase Hosting (Static)
