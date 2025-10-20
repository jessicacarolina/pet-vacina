'use client';

import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ExtractedVaccine {
  name: string;
  date: string;
  nextDose?: string;
}

interface ExtractedPetInfo {
  name?: string;
  especie?: string;
  raca?: string;
  cor?: string;
  dataNascimento?: string;
  vaccines?: ExtractedVaccine[];
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    text += pageText + '\n';
  }

  return text;
}

async function pdfToCanvas(file: File): Promise<HTMLCanvasElement> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1); // Get the first page

  // Set scale and viewport
  const scale = 2.0; // Increase scale for better OCR quality
  const viewport = page.getViewport({ scale });

  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Render PDF page to canvas
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return canvas;
}

export async function processPdfWithOcr(file: File): Promise<ExtractedPetInfo> {
  try {
    console.log('Starting PDF processing...');
    // Extract text from PDF
    const pdfText = await extractTextFromPdf(file);
    console.log('Extracted text from PDF:', pdfText);

    // Initialize Tesseract worker
    console.log('Initializing Tesseract worker...');
    const worker = await createWorker();

    try {
      await worker.loadLanguage('por');
      await worker.initialize('por');
      await worker.setParameters({
        tessedit_char_whitelist:
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ0123456789/:-,. ',
      });

      // Convert PDF to canvas first
      console.log('Converting PDF to canvas...');
      const canvas = await pdfToCanvas(file);
      console.log('PDF converted to canvas, starting OCR...');

      // Perform OCR on the canvas
      const {
        data: { text: ocrText },
      } = await worker.recognize(canvas);
      console.log('OCR text extracted successfully');

      console.log('OCR text extracted:', ocrText);

      // Combine both extracted texts
      const combinedText = `${pdfText}\n${ocrText}`;
      console.log('Combined text:', combinedText);

      // Extract information using patterns
      const petInfo: ExtractedPetInfo = {};

      // Name patterns
      const namePatterns = [
        /nome:?\s*([^\n\r]+)/i,
        /nome do animal:?\s*([^\n\r]+)/i,
        /pet:?\s*([^\n\r]+)/i,
      ];

      // Species patterns
      const especiePatterns = [
        /esp[ée]cie:?\s*([^\n\r]+)/i,
        /tipo:?\s*(cachorro|gato|ave|p[áa]ssaro|coelho)/i,
        /animal:?\s*(cachorro|gato|ave|p[áa]ssaro|coelho)/i,
      ];

      // Breed patterns
      const racaPatterns = [
        /ra[çc]a:?\s*([^\n\r]+)/i,
        /ra[çc]a do animal:?\s*([^\n\r]+)/i,
      ];

      // Color patterns
      const corPatterns = [
        /cor:?\s*([^\n\r]+)/i,
        /coloração:?\s*([^\n\r]+)/i,
        /pelagem:?\s*([^\n\r]+)/i,
      ];

      // Date patterns
      const datePatterns = [
        /nascimento:?\s*(\d{2}[/-]\d{2}[/-]\d{4})/i,
        /data de nascimento:?\s*(\d{2}[/-]\d{2}[/-]\d{4})/i,
        /nasc\.?:?\s*(\d{2}[/-]\d{2}[/-]\d{4})/i,
      ];

      // Function to extract vaccines from the table
      const extractVaccines = (text: string): ExtractedVaccine[] => {
        console.log('Extracting vaccines from text...');
        const vaccines: ExtractedVaccine[] = [];

        // Look for the vaccine history section
        const vaccineSection = text.match(
          /Histórico de Vacinas[\s\S]*?(?=Informações do Veterinário|$)/i
        )?.[0];
        if (!vaccineSection) {
          console.log('No vaccine section found');
          return vaccines;
        }

        console.log('Found vaccine section:', vaccineSection);

        // Extract rows from the table
        const tablePattern =
          /\|\s*(\d{2}\/\d{2}\/\d{4})\s*\|\s*([^|]+)\s*\|\s*(\d{2}\/\d{2}\/\d{4})/g;
        let match;

        while ((match = tablePattern.exec(vaccineSection)) !== null) {
          const [_, date, name, nextDose] = match;
          if (date && name) {
            vaccines.push({
              date: date.trim(),
              name: name.trim(),
              nextDose: nextDose?.trim(),
            });
          }
        }

        console.log('Extracted vaccines:', vaccines);
        return vaccines;
      };

      // Function to try multiple patterns and clean the result
      const findMatch = (patterns: RegExp[], text: string) => {
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            // Get the text until the next field marker or end of line
            const value = match[1].split(
              /\s+(?=[A-Za-zÀ-ÿ]+:)|\s{2,}|[|]|Histórico/
            )[0];
            return value.trim();
          }
        }
        return undefined;
      };

      // Extract information
      petInfo.name = findMatch(namePatterns, combinedText);
      petInfo.especie = findMatch(especiePatterns, combinedText);
      petInfo.raca = findMatch(racaPatterns, combinedText);
      petInfo.cor = findMatch(corPatterns, combinedText);

      console.log('Extracted fields:', {
        name: petInfo.name,
        especie: petInfo.especie,
        raca: petInfo.raca,
        cor: petInfo.cor,
      });

      const dateMatch = findMatch(datePatterns, combinedText);
      if (dateMatch) {
        console.log('Found date match:', dateMatch);
        // Parse the date in DD/MM/YYYY format
        const [day, month, year] = dateMatch.split(/[/-]/).map(Number);
        console.log('Parsed date components:', { day, month, year });

        if (day && month && year) {
          // Note: month - 1 because JavaScript months are 0-based
          petInfo.dataNascimento = `${year}-${month
            .toString()
            .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          console.log('Formatted date:', petInfo.dataNascimento);
        }
      }

      // Extract vaccines
      petInfo.vaccines = extractVaccines(combinedText);
      console.log('Final petInfo object with vaccines:', petInfo);

      return petInfo;
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF');
  }
}
