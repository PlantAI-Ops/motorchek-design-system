import { Bot, MessageSquare, Thermometer, Wrench, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChatWelcomeProps {
  motorName?: string;
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  { icon: BarChart3, label: "What's the current status?" },
  { icon: Thermometer, label: "Is this motor overheating?" },
  { icon: Wrench, label: "What maintenance is recommended?" },
];

export function ChatWelcome({ motorName, onSuggestionClick }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Avatar className="h-14 w-14 mb-4">
        <AvatarFallback className="bg-accent text-accent-foreground">
          <Bot className="h-7 w-7" />
        </AvatarFallback>
      </Avatar>

      <h3 className="text-base font-semibold text-foreground mb-1">
        MotorChek AI
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-[240px]">
        {motorName
          ? `Ask me anything about ${motorName}`
          : "Select a motor to start analyzing"}
      </p>

      {motorName && (
        <div className="flex flex-col gap-2 w-full max-w-[280px]">
          {suggestions.map((s) => (
            <Button
              key={s.label}
              variant="outline"
              size="sm"
              className="justify-start gap-2 text-xs h-auto py-2.5 px-3 text-left"
              onClick={() => onSuggestionClick(s.label)}
            >
              <s.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {s.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
