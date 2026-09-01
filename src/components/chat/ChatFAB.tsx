import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChat } from "./ChatProvider";

export function ChatFAB() {
  const { toggleChat, unreadCount } = useChat();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        size="icon"
        onClick={toggleChat}
        className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 relative"
      >
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] font-bold rounded-full"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
