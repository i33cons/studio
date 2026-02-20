"use client";

import { useState } from "react";
import { ScanText, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { extractPdfTextWithOcr } from "@/ai/flows/extract-pdf-text-with-ocr";

interface OcrModalProps {
  allFiles: File[];
}

export function OcrModal({ allFiles }: OcrModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a PDF to extract text from.",
      });
      return;
    }

    setIsLoading(true);
    setExtractedText("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const pdfDataUri = reader.result as string;
        const result = await extractPdfTextWithOcr({ pdfDataUri });
        setExtractedText(result.extractedText);
        toast({
          title: "Extraction Complete",
          description: `Text has been extracted from ${selectedFile.name}.`,
        });
      };
      reader.onerror = (error) => {
        throw new Error("Failed to read file.");
      };
    } catch (error) {
      console.error("OCR Extraction failed:", error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "Could not extract text from the selected PDF.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    toast({ title: "Copied to clipboard!" });
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedFile(null);
      setExtractedText("");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ScanText className="mr-2 h-4 w-4" /> Extract Text (OCR)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Extract Text with OCR</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Select
              onValueChange={(value) =>
                setSelectedFile(allFiles.find((f) => f.name === value) || null)
              }
            >
              <SelectTrigger className="col-span-4">
                <SelectValue placeholder="Select a PDF file..." />
              </SelectTrigger>
              <SelectContent>
                {allFiles.map((file) => (
                  <SelectItem key={file.name} value={file.name}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {extractedText && (
            <div className="relative">
              <Textarea
                readOnly
                value={extractedText}
                className="h-64 mt-4"
                placeholder="Extracted text will appear here..."
              />
              <Button size="icon" variant="ghost" className="absolute top-6 right-2 h-8 w-8" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleExtract} disabled={isLoading || !selectedFile}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Extracting..." : "Extract Text"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
