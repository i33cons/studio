// This file uses pdf-lib and pdf.js from CDN scripts loaded in layout.tsx
// We use `any` types as we can't import the types directly.

// Helper to ensure libraries are loaded
async function getPdfLib() {
  while (typeof (window as any).pdfLib === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return (window as any).pdfLib;
}

async function getPdfJs() {
  while (typeof (window as any).pdfjsLib === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const pdfjsLib = (window as any).pdfjsLib;
  // Always set the worker source to avoid race conditions or unexpected states.
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
  return pdfjsLib;
}

/**
 * Loads a PDF file into a pdf-lib document object.
 */
export async function loadPdf(file: File) {
  const pdfLib = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdfLibDoc = await pdfLib.PDFDocument.load(arrayBuffer);
  return { pdfLibDoc };
}

/**
 * Renders a specific page of a PDF as a PNG data URL thumbnail.
 */
export async function renderPageAsThumbnail(
  file: File,
  pageNumber: number,
  rotation: number
): Promise<string> {
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale: 0.5, rotation });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (context) {
    await page.render({ canvasContext: context, viewport }).promise;
  }
  
  return canvas.toDataURL("image/png");
}

/**
 * Rotates a page in a pdf-lib document.
 */
export async function rotatePageInDoc(doc: any, pageIndex: number) {
  const page = doc.getPages()[pageIndex];
  const currentRotation = page.getRotation().angle;
  const newRotation = (currentRotation + 90) % 360;
  page.setRotation(newRotation);
  return { newDoc: doc, newRotation };
}

/**
 * Deletes a page from a pdf-lib document.
 */
export async function deletePageInDoc(doc: any, pageIndex: number) {
  doc.removePage(pageIndex);
  return { newDoc: doc };
}

/**
 * Reorders a page in a pdf-lib document.
 */
export async function reorderPageInDoc(doc: any, fromIndex: number, toIndex: number) {
  const [page] = doc.getPages().splice(fromIndex, 1);
  doc.getPages().splice(toIndex, 0, page);
  return { newDoc: doc };
}

/**
 * Saves a pdf-lib document to a Uint8Array.
 */
export async function savePdfToU8Array(doc: any): Promise<Uint8Array> {
  return await doc.save();
}

/**
 * Merges multiple pdf-lib documents into one.
 */
export async function mergePdfs(docsToMerge: any[]) {
    const pdfLib = await getPdfLib();
    const mergedPdf = await pdfLib.PDFDocument.create();
    for (const doc of docsToMerge) {
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
    }
    return { pdfLibDoc: mergedPdf };
}
