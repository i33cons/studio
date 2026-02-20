import type { PDFDocument } from 'pdf-lib';

export interface PageThumbnail {
  id: string;
  pageIndex: number;
  rotation: number;
  thumbnailUrl: string;
}

export interface DocumentState {
  id: string;
  name: string;
  file: File;
  pdfLibDoc: PDFDocument;
  pages: PageThumbnail[];
}
