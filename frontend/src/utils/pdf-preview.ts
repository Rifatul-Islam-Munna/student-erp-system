import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

GlobalWorkerOptions.workerPort = new PdfWorker();

const loadPdf = async (data: Uint8Array, disableWorker = false) =>
  getDocument({
    data,
    disableWorker,
    stopAtErrors: false,
  }).promise;

export const getPdfFirstPagePreview = async (sourceBlob: Blob, scale = 1.9) => {
  const bytes = new Uint8Array(await sourceBlob.arrayBuffer());

  let pdf;
  try {
    pdf = await loadPdf(bytes, false);
  } catch (error) {
    console.warn("PDF worker preview failed, retrying without worker.", error);
    pdf = await loadPdf(bytes, true);
  }

  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas context unavailable");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png");
};
