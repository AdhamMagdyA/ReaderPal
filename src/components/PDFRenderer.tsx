"use client";
import { Loader2 } from "lucide-react";
import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { toast } from "@/components/ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFRenderer = ({ url }: { url: string }) => {
  const { width, ref } = useResizeDetector();

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 flex items-center justify-between w-full border-zinc-200 border-b px-2">
        <div className="flex items-center gap-1,5">header</div>
      </div>
      <div className="flex-1 w-full max-h-screen">
        <div ref={ref}>
          <Document
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
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
            <Page width={width ?? 1} pageNumber={1} />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFRenderer;
