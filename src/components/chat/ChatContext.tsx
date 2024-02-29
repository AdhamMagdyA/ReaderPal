import { trpc } from "@/app/_trpc/client";
import { INIFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { useMutation } from "@tanstack/react-query";
import { createContext, useEffect, useRef, useState } from "react";
import { toast } from "../ui/use-toast";

type ChatContextType = {
  addMessage: () => void;
  message: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<ChatContextType>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface ProviderProps {
  fileId: string;
  children: React.ReactNode;
}

export const ChatProvider = ({ fileId, children }: ProviderProps) => {
  const utils = trpc.useContext();

  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const backupMessage = useRef<string>("");

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      console.log(`prepared to send message: ${message}`);
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ fileId, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      // step 1
      await utils.getFileMessages.cancel();

      // step 2
      const previousMessages = utils.getFileMessages.getInfiniteData();

      // step 3
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INIFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          let newPages = [...old.pages];

          let latestPage = newPages[0]!;

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "there was a problem sending the message",
          description: "please refresh the page and try again",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumulate chunks of data
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunckValue = decoder.decode(value);
        accResponse += chunckValue;

        // append to the chat
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INIFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) {
              return {
                pages: [],
                pageParams: [],
              };
            }
            let isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response")
            );
            let updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages;
                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      id: "ai-response",
                      createdAt: new Date().toISOString(),
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        text: accResponse,
                      };
                    }
                    return message;
                  });
                }
                return {
                  ...page,
                  messages: updatedMessages,
                };
              }
              return page;
            });
            return { ...old, pages: updatedPages };
          }
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  return (
    <ChatContext.Provider
      value={{
        addMessage: () => {
          if (!isLoading) sendMessage({ message });
        },
        message,
        handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setMessage(e.target.value);
        },
        isLoading: isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
