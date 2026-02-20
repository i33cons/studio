import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// This is required for Next.js to correctly load the worker
// from a static path.
// Use the version of pdf.js that is installed from npm.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


/**
 * Loads a PDF file into a pdf-lib document object.
 */
export async function loadPdf(fileContent: ArrayBuffer) {
  const pdfLibDoc = await PDFDocument.load(fileContent);
  return { pdfLibDoc };
}

/**
 * Renders a specific page of a PDF as a PNG data URL thumbnail.
 */
export async function renderPageAsThumbnail(
  doc: PDFDocument, // pdf-lib PDFDocument
  pageNumber: number,
): Promise<string> {
  // We need to save the document to a buffer to render it with pdf.js
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
export async function rotatePageInDoc(doc: any, pageIndex: number) {
  const page = doc.getPages()[pageIndex];
  page.setRotation(degrees((page.getRotation().angle + 90) % 360));
  const newRotation = page.getRotation().angle;
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
 * This is now a synchronous operation that mutates the document.
 */
export function reorderPageInDoc(doc: any, fromIndex: number, toIndex: number) {
  doc.movePage(fromIndex, toIndex);
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
