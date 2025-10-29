import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  onActionClick: () => void;
  actionLabel: string;
}

export function Header({ onActionClick, actionLabel }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground" data-testid="text-brand">
          MLWIO API
        </h1>
        <Button 
          onClick={onActionClick}
          data-testid={`button-${actionLabel.toLowerCase()}`}
        >
          {actionLabel}
        </Button>
      </div>
    </header>
  );
}
