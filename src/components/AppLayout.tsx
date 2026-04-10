import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="sticky top-0 z-30 h-16 flex items-center px-6 lg:px-8 border-b border-border bg-surface">
          <h1 className="text-xl font-bold text-foreground pl-12 lg:pl-0">{title}</h1>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
