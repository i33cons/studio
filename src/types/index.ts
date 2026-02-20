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
  pdfLibDoc: any; // PDFDocument from pdf-lib
  pages: PageThumbnail[];
}
