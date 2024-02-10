"use client";
import { ChevronDown, ChevronLeft, ChevronUp, Loader2 } from "lucide-react";
import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { toast } from "@/components/ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { unknown } from "zod";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFRenderer = ({ url }: { url: string }) => {
  const { width, ref } = useResizeDetector();
  const [numPages, setNumPages] = React.useState<number>();
  const [curPage, setCurPage] = React.useState<number>(1);
  const pageInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 flex items-center justify-between w-full border-zinc-200 border-b px-2">
        <div className="flex items-center gap-1,5">
          <Button
            disabled={curPage === 1}
            variant={"ghost"}
            aria-label="previous page"
            onClick={() => {
              if (curPage > 1) {
                setCurPage((prev) => prev - 1);
                pageInputRef.current!.value = String(curPage - 1);
              }
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              className="w-12 h-8"
              accept="number"
              ref={pageInputRef}
              onInput={({ currentTarget }) => {
                console.log("changing page");
                const pageNumber = Number(currentTarget.value);
                if (pageNumber > 0 && pageNumber <= numPages!) {
                  setCurPage(pageNumber);
                } else if (
                  currentTarget.value === "" ||
                  currentTarget.value === "0"
                ) {
                  console.log("empty page number");
                } else {
                  console.log("invalid page number:", pageNumber);
                  if (currentTarget.value.length > 0)
                    currentTarget.value = currentTarget.value.slice(0, -1);
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            disabled={numPages === undefined || curPage === numPages!}
            variant={"ghost"}
            aria-label="next page"
            onClick={() => {
              if (curPage < numPages!) {
                setCurPage((prev) => prev + 1);
                pageInputRef.current!.value = String(curPage + 1);
              }
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen">
        <div ref={ref}>
          <Document
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
            }}
            onLoadError={() => {
              toast({
                title: "Something went wrong!",
                description: "Please try again later.",
                variant: "destructive",
              });
            }}
            file={url}
            className={"max-h-full"}
          >
            <Page
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              width={width ?? 1}
              pageNumber={curPage}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFRenderer;
