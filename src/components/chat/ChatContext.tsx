import { useMutation } from "@tanstack/react-query";
import { createContext, useState } from "react";

type ChatContextType = {
  addMessage: () => void;
  message: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
};

const ChatContext = createContext<ChatContextType>({
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
      const response = await fetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ fileId, message }),
        headers: {
          "Content-Type": "application/json",
        },
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
        handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setMessage(e.target.value);
        },
        isLoading: false,
      }}
    ></ChatContext.Provider>
  );
};
