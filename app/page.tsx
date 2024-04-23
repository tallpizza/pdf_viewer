"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./main.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type PDFFile = File | null;

export default function DefaultPage() {
  const [file, setFile] = useState<PDFFile>();
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scale, setScale] = useState<number>();

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

  useEffect(() => {
    if (currentPage.length === 0) {
      return;
    }

    const topPage = min(currentPage);
    const fileName = file?.name;
    if (fileName) {
      localStorage.setItem(fileName, topPage.toString());
    }
  }, [currentPage]);

  useEffect(() => {
    if (numPages > 0 && file && file.name && localStorage.getItem(file.name)) {
      const storedPage = Number(localStorage.getItem(file.name));
      if (storedPage === 0 || storedPage == 1) {
        return;
      }

      setTimeout(() => {
        if (confirm("최근 읽은 페이지로 이동하시겠습니까?")) {
          pageRefs.current[storedPage - 1]?.scrollIntoView();
        }
      }, 300);
    }

    const storedScale = localStorage.getItem("scale");
    if (storedScale) {
      setScale(Number(storedScale));
    }
  }, [numPages, file]);

  useEffect(() => {
    if (scale) {
      localStorage.setItem("scale", scale.toString());
    }
  }, [scale]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 fixed top-0 left-0 w-full bg-[#333] text-white text-center py-2 h-[30px] md:h-[50px] font-medium z-10">
        {min(currentPage) + "/" + numPages}
        <Button variant="ghost" size="icon" onClick={zoomIn}>
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={zoomOut}>
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>
      <div className=" w-full flex flex-col items-center mt-[30px] md:mt-[50px] p-3">
        <div className="document__load">
          <input onChange={onFileChange} type="file" accept="application/pdf" />
        </div>
        <div className="document__main">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_document_${index + 1}`}
                ref={(el) => (pageRefs.current[index] = el)}
                data-page-number={index + 1}
              >
                <div className="page-top-marker" data-page-number={index + 1}>
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={scale}
                  />
                </div>
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
  function zoomIn() {
    if (!scale) {
      setScale(1);
      return;
    }
    setScale(scale * 1.1); // 확대
  }

  function zoomOut() {
    if (!scale) {
      setScale(1);
      return;
    }
    setScale(scale / 1.1); // 축소
  }

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
