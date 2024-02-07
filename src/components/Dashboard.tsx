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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";

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
                <li
                  key={file.id}
                  className="col-span-1 divide-y divide-gray-100 rounded-lg bg-white shadow transition hover:shadow-lg"
                >
                  <Link
                    href={`/dashboard/${file.id}`}
                    className="flex flex-col gap-2"
                  >
                    <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="truncate text-lg font-medium text-zinc-900">
                            {file.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>
                        {format(new Date(file.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      13 messages
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger className="w-full">
                        <Button
                          size="sm"
                          className="w-full"
                          variant="destructive"
                        >
                          {deletingFile === file.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your PDF and your messages with it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            color="red"
                            style={{
                              backgroundColor: "hsl(0, 86%, 97%)", // light theme destructive background
                              color: "hsl(0, 74%, 42%)", // light theme destructive foreground
                            }}
                            onClick={() => deleteFile({ id: file.id })}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
