"use client";

import { useState, useCallback } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  isLoading: boolean;
}

export function FileDropzone({ onDrop, isLoading }: FileDropzoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <Card
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl transition-colors duration-200 ${
        isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
      }`}
    >
      <CardContent className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-12rem)] cursor-pointer">
        <input {...getInputProps()} />
        {isLoading ? (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold text-foreground">Processing PDFs...</p>
            <p className="text-muted-foreground">Please wait a moment.</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold font-headline mb-2">
              Drag & Drop PDFs Here
            </h2>
            <p className="text-muted-foreground mb-6">
              or click to select files from your computer
            </p>
            <Button size="lg" variant="default" className="pointer-events-none">
              Browse Files
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
