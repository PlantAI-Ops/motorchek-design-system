import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^• (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/(<li.*<\/li>\n?)+/gs, (match) => `<ul class="my-1">${match}</ul>`)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground",
          )}
        >
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "group relative max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-surface-raised text-foreground border border-border",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="whitespace-pre-wrap [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_li]:ml-4 [&_li]:my-0.5"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}
        <span
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
            isUser ? "-left-14" : "-right-14",
          )}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
