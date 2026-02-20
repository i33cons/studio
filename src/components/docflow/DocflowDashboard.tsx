"use client";

import { useState, useCallback } from "react";
import type { DocumentState, PageThumbnail } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  loadPdf,
  renderPageAsThumbnail,
  rotatePageInDoc,
  deletePageInDoc,
  reorderPageInDoc,
  savePdfToU8Array,
  mergePdfs,
} from "@/lib/pdf-utils";
import { FileDropzone } from "@/components/docflow/FileDropzone";
import { DocumentList } from "@/components/docflow/DocumentList";
import { DocumentWorkspace } from "@/components/docflow/DocumentWorkspace";

export function DocflowDashboard() {
  const [documents, setDocuments] = useState<DocumentState[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileDrop = useCallback(async (files: File[]) => {
    setIsLoading(true);
    try {
      const newDocuments: DocumentState[] = [];
      for (const file of files) {
        if (file.type !== "application/pdf") {
          toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: `${file.name} is not a PDF.`,
          });
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const { pdfLibDoc } = await loadPdf(arrayBuffer);
        const pageThumbnails: PageThumbnail[] = [];
        for (let i = 0; i < pdfLibDoc.getPageCount(); i++) {
          const thumbnailUrl = await renderPageAsThumbnail(pdfLibDoc, i + 1);
          pageThumbnails.push({
            id: `${file.name}-page-${i}`,
            pageIndex: i,
            rotation: 0,
            thumbnailUrl,
          });
        }

        newDocuments.push({
          id: file.name + Date.now(),
          name: file.name,
          file,
          pdfLibDoc,
          pages: pageThumbnails,
        });
      }

      const updatedDocuments = [...documents, ...newDocuments];
      setDocuments(updatedDocuments);
      if (updatedDocuments.length > 0 && !activeDocumentId) {
        setActiveDocumentId(updatedDocuments[0].id);
      }
      toast({
        title: "Success",
        description: `${files.length} PDF(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error processing your PDFs.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [documents, activeDocumentId, toast]);

  const handleRotatePage = async (docId: string, pageId: string) => {
    const docIndex = documents.findIndex((d) => d.id === docId);
    if (docIndex === -1) return;

    const pageIndexInDoc = documents[docIndex].pages.findIndex((p) => p.id === pageId);
    if (pageIndexInDoc === -1) return;
    
    const originalPageIndex = documents[docIndex].pages[pageIndexInDoc].pageIndex;

    const updatedDocuments = [...documents];
    const docToUpdate = { ...updatedDocuments[docIndex] };
    
    const { newDoc, newRotation } = await rotatePageInDoc(docToUpdate.pdfLibDoc, originalPageIndex);
    docToUpdate.pdfLibDoc = newDoc;

    const newThumbnailUrl = await renderPageAsThumbnail(docToUpdate.pdfLibDoc, originalPageIndex + 1);
    
    const pageToUpdate = { ...docToUpdate.pages[pageIndexInDoc], rotation: newRotation, thumbnailUrl: newThumbnailUrl };
    docToUpdate.pages = [...docToUpdate.pages];
    docToUpdate.pages[pageIndexInDoc] = pageToUpdate;

    updatedDocuments[docIndex] = docToUpdate;
    setDocuments(updatedDocuments);
  };
  
  const handleDeletePage = async (docId: string, pageId: string) => {
    const docIndex = documents.findIndex((d) => d.id === docId);
    if (docIndex === -1) return;
  
    const pageIndexInDoc = documents[docIndex].pages.findIndex((p) => p.id === pageId);
    if (pageIndexInDoc === -1) return;
  
    const originalPageIndex = documents[docIndex].pages[pageIndexInDoc].pageIndex;
  
    const updatedDocuments = [...documents];
    const docToUpdate = { ...updatedDocuments[docIndex] };
  
    // Delete the page from the pdf-lib document
    const { newDoc } = await deletePageInDoc(docToUpdate.pdfLibDoc, originalPageIndex);
    docToUpdate.pdfLibDoc = newDoc;
  
    // Create a new pages array, and re-calculate pageIndex for UI consistency.
    const remainingPages = docToUpdate.pages
      .filter((p) => p.id !== pageId)
      .map((p, i) => ({
        ...p,
        pageIndex: i, // The new pageIndex is simply its index in the new array
      }));
  
    docToUpdate.pages = remainingPages;
  
    // Refresh thumbnails for the entire document to reflect page number changes
    for (let i = 0; i < docToUpdate.pages.length; i++) {
      const page = docToUpdate.pages[i];
      page.thumbnailUrl = await renderPageAsThumbnail(docToUpdate.pdfLibDoc, i + 1);
    }
  
    updatedDocuments[docIndex] = docToUpdate;
    setDocuments(updatedDocuments);
  };

  const handleReorderPage = (docId: string, dragIndex: number, hoverIndex: number) => {
    setDocuments(prevDocs => {
      const docIndex = prevDocs.findIndex((d) => d.id === docId);
      if (docIndex === -1) return prevDocs;

      const newDocs = [...prevDocs];
      const docToUpdate = { ...newDocs[docIndex] };
      
      // Mutate the pdf doc synchronously
      reorderPageInDoc(docToUpdate.pdfLibDoc, dragIndex, hoverIndex);

      // Update the UI state to match
      const reorderedPages = [...docToUpdate.pages];
      const [draggedPage] = reorderedPages.splice(dragIndex, 1);
      reorderedPages.splice(hoverIndex, 0, draggedPage);
      docToUpdate.pages = reorderedPages.map((p, i) => ({ ...p, pageIndex: i }));
      
      newDocs[docIndex] = docToUpdate;
      return newDocs;
    });
  };

  const handleSavePdf = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    setIsLoading(true);
    try {
      const pdfBytes = await savePdfToU8Array(doc.pdfLibDoc);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `edited_${doc.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Success", description: "Your PDF has been saved." });
    } catch(e) {
      toast({ variant: "destructive", title: "Error saving PDF", description: e instanceof Error ? e.message : "Could not save PDF." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMergePdfs = async (docIds: string[]) => {
    if (docIds.length < 2) {
      toast({
        variant: "destructive",
        title: "Not enough files",
        description: "Please select at least two PDFs to merge.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const docsToMerge = documents.filter(doc => docIds.includes(doc.id));
      const { pdfLibDoc } = await mergePdfs(docsToMerge.map(d => d.pdfLibDoc));
      const newFile = new File([await pdfLibDoc.save()], 'merged.pdf', { type: 'application/pdf' });
      const arrayBuffer = await newFile.arrayBuffer();
      // Use existing logic to add the new merged PDF
      const { pdfLibDoc: newPdfLibDoc } = await loadPdf(arrayBuffer);
      const pageThumbnails: PageThumbnail[] = [];
      for (let i = 0; i < newPdfLibDoc.getPageCount(); i++) {
        const thumbnailUrl = await renderPageAsThumbnail(newPdfLibDoc, i + 1);
        pageThumbnails.push({
          id: `merged.pdf-page-${i}`,
          pageIndex: i,
          rotation: 0,
          thumbnailUrl,
        });
      }
      const newMergedDocument: DocumentState = {
        id: 'merged.pdf' + Date.now(),
        name: 'merged.pdf',
        file: newFile,
        pdfLibDoc: newPdfLibDoc,
        pages: pageThumbnails,
      };

      const updatedDocuments = [...documents, newMergedDocument];
      setDocuments(updatedDocuments);
      setActiveDocumentId(newMergedDocument.id);

      toast({ title: "Success", description: "PDFs merged. New 'merged.pdf' created." });
    } catch(e) {
       toast({ variant: "destructive", title: "Error merging PDFs", description: e instanceof Error ? e.message : "Could not merge PDFs." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteDocument = (docId: string) => {
    setDocuments(docs => {
        const newDocs = docs.filter(d => d.id !== docId);
        if (activeDocumentId === docId) {
            setActiveDocumentId(newDocs.length > 0 ? newDocs[0].id : null);
        }
        return newDocs;
    });
  };


  const activeDocument = documents.find((doc) => doc.id === activeDocumentId);

  if (documents.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <FileDropzone onDrop={handleFileDrop} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <DocumentList
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelectDocument={setActiveDocumentId}
        onDeleteDocument={handleDeleteDocument}
        onMergePdfs={handleMergePdfs}
        onFileDrop={handleFileDrop}
      />
      <DocumentWorkspace
        document={activeDocument}
        onRotatePage={handleRotatePage}
        onDeletePage={handleDeletePage}
        onReorderPage={handleReorderPage}
        onSavePdf={handleSavePdf}
        isLoading={isLoading}
      />
    </div>
  );
}
