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
// Use the server API route for OCR extraction to be compatible with static export

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
        try {
          // Lazy-load heavy libraries in client only
          const [{ createWorker }, pdfjsLib] = await Promise.all([
            import('tesseract.js'),
            import('pdfjs-dist/legacy/build/pdf'),
          ]);

          // Convert data URI to Uint8Array
          const base64 = pdfDataUri.split(',')[1];
          const raw = atob(base64);
          const len = raw.length;
          const uint8 = new Uint8Array(len);
          for (let i = 0; i < len; i++) uint8[i] = raw.charCodeAt(i);

          // Load PDF
          const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;

          const worker = await createWorker({
            logger: () => {},
          });
          await worker.load();
          await worker.loadLanguage('eng');
          await worker.initialize('eng');

          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            await page.render({ canvasContext: context, viewport }).promise;

            const { data: { text } } = await worker.recognize(canvas);
            fullText += `\n\n${text}`;
          }

          await worker.terminate();

          setExtractedText(fullText.trim());
          toast({
            title: 'Extraction Complete',
            description: `Text has been extracted from ${selectedFile.name}.`,
          });
        } catch (err) {
          console.error('OCR client failed', err);
          toast({
            variant: 'destructive',
            title: 'Extraction Failed',
            description: 'Could not extract text from the selected PDF (client).',
          });
        }
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
