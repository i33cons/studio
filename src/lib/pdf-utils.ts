import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// By installing pdfjs-dist via npm, we can avoid CDN loading issues.
// We set the workerSrc to a reliable CDN URL as a pragmatic way
// to avoid complex bundler configurations for the worker file.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

/**
 * Loads a PDF file into a pdf-lib document object.
 */
export async function loadPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfLibDoc = await PDFDocument.load(arrayBuffer);
  return { pdfLibDoc };
}

/**
 * Renders a specific page of a PDF as a PNG data URL thumbnail.
 */
export async function renderPageAsThumbnail(
  doc: any, // pdf-lib PDFDocument
  pageNumber: number,
  rotation: number
): Promise<string> {
  // pdf-lib docs need to be saved to a buffer to be rendered by pdf.js
  const pdfBytes = await doc.save();
  const data = new Uint8Array(pdfBytes);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
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
  const [page] = await doc.copyPages(doc, [fromIndex]);
  doc.removePage(fromIndex);
  doc.insertPage(toIndex, page);
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
    const mergedPdf = await PDFDocument.create();
    for (const doc of docsToMerge) {
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
    }
    return { pdfLibDoc: mergedPdf };
}
