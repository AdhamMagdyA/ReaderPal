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
import {
  Ghost,
  Loader2,
  MessageSquare,
  Plus,
  Trash,
  XOctagon,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { File } from "@/types/File";
import { trpc } from "@/app/_trpc/client";

interface FileCardProps {
  file: File;
  deleteFile: (args: { id: string }) => void;
  deletingFile: string | null;
}

export const FileCard = ({ file, deleteFile, deletingFile }: FileCardProps) => {
  const { data: messagesNumber } = trpc.getFileMessagesCount.useQuery({
    fileId: file.id,
  });
  return (
    <li
      key={file.id}
      className="col-span-1 divide-y divide-gray-100 rounded-lg bg-white shadow transition hover:shadow-lg"
    >
      <Link href={`/dashboard/${file.id}`} className="flex flex-col gap-2">
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
          <span>{format(new Date(file.createdAt), "dd MMM yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {messagesNumber} messages
        </div>
        <AlertDialog>
          <AlertDialogTrigger className="w-full">
            <Button size="sm" className="w-full" variant="destructive">
              {deletingFile === file.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                PDF and your messages with it.
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
  );
};
