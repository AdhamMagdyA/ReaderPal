import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import "react-loading-skeleton/dist/skeleton.css";
// for the react pdf viewer
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
// for the simplebar
import "simplebar-react/dist/simplebar.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReaderPal",
  description:
    "Chat with your documents in minutes. Ask questions, take notes, and improve your reading comprehension with ReaderPal.",
  icons: "/favicon.ico",
  openGraph: {
    title: "ReaderPal",
    description:
      "Chat with your documents in minutes. Ask questions, take notes, and improve your reading comprehension with ReaderPal.",
    images: [
      {
        url: "/og-image.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReaderPal",
    description:
      "Chat with your documents in minutes. Ask questions, take notes, and improve your reading comprehension with ReaderPal.",
    images: ["/og-image.png"],
    creator: "@AdhamMagdyA",
  },
  metadataBase: new URL("https://readerpal.vercel.app"),
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn(
            "min-h-screen font-sans antialiased grainy",
            inter.className
          )}
        >
          <NavBar />
          <Toaster />
          {children}
        </body>
      </Providers>
    </html>
  );
}
