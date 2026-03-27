import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function getPDFMetadata(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return {
    pageCount: pdf.numPages,
    pdfDoc: pdf
  };
}

export async function generateThumbnail(pdf: pdfjsLib.PDFDocumentProxy, pageIndex: number): Promise<string> {
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: 0.5 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (context) {
    await page.render({ canvasContext: context, viewport, canvas }).promise;
    return canvas.toDataURL();
  }
  return '';
}

export async function mergePDFs(
  files: { id: string, file: File }[],
  pages: { fileId: string, pageIndex: number, rotation: number, isDeleted: boolean }[]
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  // Cache loaded PDF documents to avoid re-loading the same file multiple times
  const pdfCache: Record<string, PDFDocument> = {};

  for (const pageInfo of pages) {
    if (pageInfo.isDeleted) continue;

    if (!pdfCache[pageInfo.fileId]) {
      const file = files.find(f => f.id === pageInfo.fileId);
      if (file) {
        const arrayBuffer = await file.file.arrayBuffer();
        pdfCache[pageInfo.fileId] = await PDFDocument.load(arrayBuffer);
      }
    }

    const srcDoc = pdfCache[pageInfo.fileId];
    if (srcDoc) {
      const [copiedPage] = await mergedPdf.copyPages(srcDoc, [pageInfo.pageIndex]);
      if (pageInfo.rotation !== 0) {
        copiedPage.setRotation(degrees(pageInfo.rotation));
      }
      mergedPdf.addPage(copiedPage);
    }
  }

  return await mergedPdf.save();
}
