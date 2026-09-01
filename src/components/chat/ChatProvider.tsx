import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ChatMessage } from "./types";
import { chatAPI } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { MOCK_MOTORS } from "@/data/mockMotors";

interface ChatContextType {
  messages: ChatMessage[];
  currentMotorId: string | null;
  isOpen: boolean;
  isTyping: boolean;
  unreadCount: number;
  sendMessage: (content: string) => void;
  setCurrentMotor: (motorId: string | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  currentMotorId: null,
  isOpen: false,
  isTyping: false,
  unreadCount: 0,
  sendMessage: () => {},
  setCurrentMotor: () => {},
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
});

let messageCounter = 0;
function nextId(): string {
  return `msg-${Date.now()}-${++messageCounter}`;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMotorId, setCurrentMotorId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { token } = useAuth();

  const setCurrentMotor = useCallback((motorId: string | null) => {
    setCurrentMotorId((prev) => {
      if (prev === motorId) return prev;
      // Motor changed — add system message
      if (motorId) {
        const motor = MOCK_MOTORS.find((m) => m.id === motorId);
        if (motor) {
          const sysMsg: ChatMessage = {
            id: nextId(),
            role: "system",
            content: `Now viewing: ${motor.name}`,
            motorId,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, sysMsg]);
        }
      }
      // Reset conversation for new motor
      setConversationId(null);
      return motorId;
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const motorId = currentMotorId;
      if (!motorId || !token) return;

      const userMessage: ChatMessage = {
        id: nextId(),
        role: "user",
        content,
        motorId,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        // Build history for context (last 20 messages, user + assistant only)
        const history = messages
          .filter((m) => m.role !== "system")
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        const { reply, conversation_id } = await chatAPI({
          message: content,
          motorId,
          conversationId: conversationId ?? undefined,
          history,
          token,
        });

        const assistantMessage: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: reply,
          motorId,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(conversation_id);
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: error instanceof Error
            ? `Error: ${error.message}`
            : "Sorry, I couldn't process your request. Please try again.",
          motorId,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
        if (!isOpen) setUnreadCount((c) => c + 1);
      }
    },
    [currentMotorId, isOpen, token, messages, conversationId],
  );

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        currentMotorId,
        isOpen,
        isTyping,
        unreadCount,
        sendMessage,
        setCurrentMotor,
        openChat,
        closeChat,
        toggleChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
