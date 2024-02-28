import { useMutation } from "@tanstack/react-query";
import { createContext, useState } from "react";

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
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  });

  return (
    <ChatContext.Provider
      value={{
        addMessage: () => sendMessage({ message }),
        message,
        handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setMessage(e.target.value);
        },
        isLoading: false,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
