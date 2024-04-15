"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./Sample.css";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type PDFFile = string | File | null;

export default function Sample() {
  const [file, setFile] = useState<PDFFile>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const options = useMemo(
    () => ({
      cMapUrl: "/cmaps/",
      standardFontDataUrl: "/standard_fonts/",
    }),
    []
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const handleIntersection = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const page = entry.target.getAttribute("data-page-number");
          if (page) {
            setCurrentPage((prev: number[]) => [...prev, Number(page)]);
          }
        } else {
          const page = entry.target.getAttribute("data-page-number");
          if (page) {
            setCurrentPage((prev: number[]) =>
              prev.filter((p) => p !== Number(page))
            );
          }
        }
      });
    };

    document.querySelectorAll(".page-top-marker").forEach((marker) => {
      const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: "0px",
        threshold: 0.01,
      });
      observer.observe(marker);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [numPages]);

  return (
    <div>
      <div className="header">{min(currentPage) + "/" + numPages}</div>
      <div className="container">
        <div className="container__load">
          <input onChange={onFileChange} type="file" accept="application/pdf" />
        </div>
        <div className="container__document">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_container_${index + 1}`}
                ref={(el) => (pageRefs.current[index] = el)}
                data-page-number={index + 1}
              >
                <div className="page-top-marker" data-page-number={index + 1}>
                  <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                </div>
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
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
    pageRefs.current = Array(nextNumPages).fill(null); // Reset refs
  }
}

function min(a: number[]): number {
  if (a.length === 0) {
    return 0;
  }

  let minValue = a[0];

  for (let i = 1; i < a.length; i++) {
    if (a[i] < minValue) {
      minValue = a[i];
    }
  }

  return minValue;
}
