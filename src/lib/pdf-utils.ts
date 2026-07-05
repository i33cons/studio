import { PDFDocument, degrees } from 'pdf-lib';

const PDFJS_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function loadPdfJs() {
  return new Promise<any>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('pdf.js can only be loaded in the browser'));
      return;
    }

    const pdfjsLib = (window as Window & { pdfjsLib?: any }).pdfjsLib;
    if (pdfjsLib) {
      resolve(pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_CDN_URL;
    script.async = true;
    script.onload = () => {
      const loadedPdfJs = (window as Window & { pdfjsLib?: any }).pdfjsLib;
      if (loadedPdfJs) {
        loadedPdfJs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        resolve(loadedPdfJs);
      } else {
        reject(new Error('Failed to initialize pdf.js'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load pdf.js from CDN'));
    document.head.appendChild(script);
  });
}

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
  doc: PDFDocument,
  pageNumber: number,
): Promise<string> {
  // We need to save the document to a buffer to render it with pdf.js
  const pdfBytes = await doc.save();
  const data = new Uint8Array(pdfBytes);
  const pdfjs = await loadPdfJs();
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
  page.setRotation(degrees((page.getRotation().angle + 90) % 360));
  const newRotation = page.getRotation().angle;
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
 * Reorders a page in a pdf-lib document by creating a new document.
 */
export async function reorderPageInDoc(doc: PDFDocument, fromIndex: number, toIndex: number) {
  const newDoc = await PDFDocument.create();
  const pageIndices = doc.getPageIndices();

  // Re-order the indices
  const [movedPageIndex] = pageIndices.splice(fromIndex, 1);
  pageIndices.splice(toIndex, 0, movedPageIndex);

  const copiedPages = await newDoc.copyPages(doc, pageIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

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

/**
 * Extracts text content from a PDF locally in the browser using pdf.js.
 * This only extracts pre-embedded digital text (no OCR on image-only pages).
 */
export async function extractTextLocally(doc: PDFDocument): Promise<string> {
  const pdfBytes = await doc.save();
  const data = new Uint8Array(pdfBytes);
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data }).promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }
  
  return fullText.trim();
}

