"use client";

import { useMemo, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import "./Sample.css";

import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type PDFFile = string | File | null;

export default function Sample() {
  const [file, setFile] = useState<PDFFile>("");
  const [numPages, setNumPages] = useState<number>();

  const options = useMemo(
    () => ({
      cMapUrl: "/cmaps/",
      standardFontDataUrl: "/standard_fonts/",
    }),
    []
  );

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { files } = event.target;

    if (files && files[0]) {
      setFile(files[0] || null);
    }
  }

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  return (
    <div className="Example">
      <div className="Example__container">
        <div className="Example__container__load">
          <input onChange={onFileChange} type="file" accept="application/pdf" />
        </div>
        <div className="Example__container__document">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_container_${index + 1}`}>
                <p className="mt-3 mb-1 text-white text-[14px] lg:text-[18px]">
                  p{index + 1}
                </p>
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
