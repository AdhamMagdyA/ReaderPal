import React from "react";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { toast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

interface PdfFullScreenButtonProps {
  url: string;
}

const PdfFullScreenButton = ({ url }: PdfFullScreenButtonProps) => {
  const [numPages, setNumPages] = React.useState<number>();
  const { width, ref } = useResizeDetector();

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="gap-1.5" aria-label="fullscreen" variant={"ghost"}>
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
              {new Array(numPages).fill(0).map((_, index) => {
                return (
                  <Page
                    key={index}
                    loading={
                      <div className="flex justify-center">
                        <Loader2 className="my-24 h-6 w-6 animate-spin" />
                      </div>
                    }
                    width={width ?? 1}
                    pageNumber={index + 1}
                  />
                );
              })}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullScreenButton;
