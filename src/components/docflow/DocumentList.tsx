"use client";

import { useState } from "react";
import { FileText, Check, Trash2, Merge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OcrModal } from "@/components/docflow/OcrModal";
import type { DocumentState } from "@/types";

interface DocumentListProps {
  documents: DocumentState[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onMergePdfs: (docIds: string[]) => void;
  allFiles: File[];
}

export function DocumentList({
  documents,
  activeDocumentId,
  onSelectDocument,
  onDeleteDocument,
  onMergePdfs,
  allFiles
}: DocumentListProps) {
  const [selectedToMerge, setSelectedToMerge] = useState<Set<string>>(new Set());

  const toggleMergeSelection = (docId: string) => {
    const newSelection = new Set(selectedToMerge);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedToMerge(newSelection);
  };

  const handleMerge = () => {
    onMergePdfs(Array.from(selectedToMerge));
    setSelectedToMerge(new Set());
  };

  return (
    <aside className="w-80 border-r bg-card p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-lg font-headline font-semibold">Your Documents</h2>
      <div className="flex flex-col gap-2 flex-1">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            onClick={() => onSelectDocument(doc.id)}
            className={cn(
              "p-3 cursor-pointer transition-all relative group",
              activeDocumentId === doc.id
                ? "border-primary ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary/80" />
              <p className="text-sm font-medium truncate flex-1">{doc.name}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMergeSelection(doc.id);
                }}
                className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  selectedToMerge.has(doc.id) ? "bg-accent border-accent" : "bg-transparent border-border"
                )}
              >
                {selectedToMerge.has(doc.id) && <Check className="h-3 w-3 text-accent-foreground" />}
              </button>
            </div>
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                }}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-2 pt-4 border-t">
        <Button onClick={handleMerge} disabled={selectedToMerge.size < 2}>
          <Merge className="mr-2 h-4 w-4" /> Merge Selected ({selectedToMerge.size})
        </Button>
        <OcrModal allFiles={allFiles} />
      </div>
    </aside>
  );
}
