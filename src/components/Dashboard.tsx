"use client";
import React from "react";
import UploadButton from "./UploadButton";
import { trpc } from "@/app/_trpc/client";
import {
  Ghost,
  Loader2,
  MessageSquare,
  Plus,
  Trash,
  XOctagon,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { FileCard } from "./FileCard";

const Dashboard = () => {
  const [deletingFile, setDeletingFile] = React.useState<string | null>(null);
  const utils = trpc.useContext();
  const {
    data: files,
    isLoading,
    isError,
    error,
  } = trpc.getUserFiles.useQuery();
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate();
    },
    onMutate: ({ id }) => {
      setDeletingFile(id);
    },
    onSettled: () => {
      setDeletingFile(null);
    },
  });

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>
        <UploadButton />
      </div>
      <div className="mt-8">
        {isLoading ? (
          <Skeleton count={3} height={80} className="my-3 mx-2" />
        ) : isError ? (
          <div className="flex justify-center">
            <Alert className="max-w-80">
              <XOctagon className="h-4 w-4" color="red" />
              <AlertTitle>Oops, something went wrong!</AlertTitle>
              <AlertDescription>{error?.message}</AlertDescription>
            </Alert>
          </div>
        ) : !files || files?.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2">
            <Ghost className="h-8 w-8 text-zinc-800" />
            <h3 className="font-semibold text-xl">Pretty empty around here</h3>
            <p>let&apos;s upload your first PDF.</p>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-z-200 md:grid-cols-2 lg:grid-cols-3">
            {files
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((file) => (
                <FileCard
                  file={file}
                  deleteFile={deleteFile}
                  deletingFile={deletingFile}
                />
              ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
