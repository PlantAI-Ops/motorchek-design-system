import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_MOTORS } from "@/data/mockMotors";
import { useChat } from "./ChatProvider";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatInput } from "./ChatInput";
import { ChatWelcome } from "./ChatWelcome";

export function ChatPanel() {
  const { messages, currentMotorId, isOpen, isTyping, sendMessage, closeChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const motor = currentMotorId ? MOCK_MOTORS.find((m) => m.id === currentMotorId) : null;

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeChat()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-accent text-accent-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base">MotorChek AI</SheetTitle>
              {motor ? (
                <SheetDescription className="flex items-center gap-2">
                  <span className="truncate">{motor.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                    {motor.status}
                  </Badge>
                </SheetDescription>
              ) : (
                <SheetDescription>Select a motor to begin</SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <ChatWelcome
              motorName={motor?.name}
              onSuggestionClick={sendMessage}
            />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="flex gap-2.5 mb-4">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <Bot className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-surface-raised border border-border rounded-lg px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <ChatInput
          onSend={sendMessage}
          disabled={!currentMotorId || isTyping}
        />
      </SheetContent>
    </Sheet>
  );
}
