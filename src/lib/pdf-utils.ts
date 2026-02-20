import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// This is required for Next.js to correctly load the worker
// from a static path.
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
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
  doc: PDFDocument, // pdf-lib PDFDocument
  pageNumber: number,
): Promise<string> {
  const pdfBytes = await doc.save();
  const data = new Uint8Array(pdfBytes);
  const pdf = await pdfjs.getDocument({ data }).promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale: 0.5 });
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
export async function rotatePageInDoc(doc: PDFDocument, pageIndex: number) {
  const page = doc.getPages()[pageIndex];
  const newRotation = (page.getRotation().angle + 90) % 360;
  page.setRotation(degrees(newRotation));
  return { newDoc: doc, newRotation };
}

/**
 * Deletes a page from a pdf-lib document.
 */
export async function deletePageInDoc(doc: PDFDocument, pageIndex: number) {
  doc.removePage(pageIndex);
  return { newDoc: doc };
}

/**
 * Reorders a page in a pdf-lib document.
 * This is an expensive operation as it creates a new document.
 */
export async function reorderPageInDoc(doc: PDFDocument, fromIndex: number, toIndex: number) {
  const newDoc = await doc.copy();
  newDoc.movePage(fromIndex, toIndex);
  return { newDoc };
}


/**
 * Saves a pdf-lib document to a Uint8Array.
 */
export async function savePdfToU8Array(doc: PDFDocument): Promise<Uint8Array> {
  return await doc.save();
}

/**
 * Merges multiple pdf-lib documents into one.
 */
export async function mergePdfs(docsToMerge: PDFDocument[]) {
    const mergedPdf = await PDFDocument.create();
    for (const doc of docsToMerge) {
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
    }
    return { pdfLibDoc: mergedPdf };
}
