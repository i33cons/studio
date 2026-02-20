"use client";

import { File, Save, Loader2 } from "lucide-react";
import { PageThumbnail } from "./PageThumbnail";
import { Button } from "@/components/ui/button";
import type { DocumentState } from "@/types";

interface DocumentWorkspaceProps {
  document: DocumentState | undefined;
  onRotatePage: (docId: string, pageId: string) => void;
  onDeletePage: (docId: string, pageId: string) => void;
  onReorderPage: (docId: string, dragIndex: number, hoverIndex: number) => void;
  onSavePdf: (docId: string) => void;
  isLoading: boolean;
}

export function DocumentWorkspace({
  document,
  onRotatePage,
  onDeletePage,
  onReorderPage,
  onSavePdf,
  isLoading,
}: DocumentWorkspaceProps) {
  if (!document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 p-8 text-center">
        <File className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">No Document Selected</h2>
        <p className="text-muted-foreground">
          Select a document from the left panel to start editing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <h2 className="text-lg font-headline font-semibold truncate" title={document.name}>
          Editing: {document.name}
        </h2>
        <Button onClick={() => onSavePdf(document.id)} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save PDF
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {document.pages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              docId={document.id}
              page={page}
              index={index}
              onRotate={() => onRotatePage(document.id, page.id)}
              onDelete={() => onDeletePage(document.id, page.id)}
              onReorder={onReorderPage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
