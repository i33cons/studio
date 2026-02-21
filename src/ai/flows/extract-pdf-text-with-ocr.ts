// Server-only flow: keep as a plain server module (not a Next Server Action)
/**
 * @fileOverview This file implements a Genkit flow to extract all textual content from a PDF document,
 * including text from scanned images via OCR.
 *
 * - extractPdfTextWithOcr - A function that extracts text from a PDF using OCR capabilities.
 * - ExtractPdfTextWithOcrInput - The input type for the extractPdfTextWithOcr function.
 * - ExtractPdfTextWithOcrOutput - The return type for the extractPdfTextWithOcr function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const ExtractPdfTextWithOcrInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document content as a data URI, including MIME type 'application/pdf' and Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractPdfTextWithOcrInput = z.infer<typeof ExtractPdfTextWithOcrInputSchema>;

const ExtractPdfTextWithOcrOutputSchema = z.object({
  extractedText: z.string().describe('All extracted textual content from the PDF, including OCR results.'),
});
export type ExtractPdfTextWithOcrOutput = z.infer<typeof ExtractPdfTextWithOcrOutputSchema>;

export async function extractPdfTextWithOcr(
  input: ExtractPdfTextWithOcrInput
): Promise<ExtractPdfTextWithOcrOutput> {
  return extractPdfTextWithOcrFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPdfTextWithOcrPrompt',
  input: { schema: ExtractPdfTextWithOcrInputSchema },
  output: { schema: ExtractPdfTextWithOcrOutputSchema },
  model: googleAI.model('gemini-2.5-flash-image'),
  prompt: `Extract all textual content from the provided PDF document. Include any text found in scanned images through OCR. Provide the extracted text as a single string.\n\nDocument: {{media url=pdfDataUri contentType='application/pdf'}}`,
  config: {
    responseModalities: ['TEXT'],
  }
});

const extractPdfTextWithOcrFlow = ai.defineFlow(
  {
    name: 'extractPdfTextWithOcrFlow',
    inputSchema: ExtractPdfTextWithOcrInputSchema,
    outputSchema: ExtractPdfTextWithOcrOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to extract text from PDF.');
    }

    return output;
  }
);
