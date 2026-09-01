import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  Wrench,
  Activity,
  FileText,
  ScrollText,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

const navSections = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", path: "/", icon: LayoutDashboard }],
  },
  {
    label: "Assets",
    items: [
      { title: "Motors", path: "/motors", icon: Cpu },
      { title: "Specs", path: "/specs", icon: FileText },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Inspections", path: "/inspections", icon: Wrench },
      { title: "Analysis", path: "/analysis", icon: Activity },
    ],
  },
  {
    label: "Documents",
    items: [{ title: "Documents", path: "/documents", icon: FileText }],
  },
  {
    label: "Admin",
    minRole: "admin" as const,
    items: [
      { title: "Audit Log", path: "/audit", icon: ScrollText },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", path: "/settings", icon: Settings }],
  },
];

export function AppSidebar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleSections = navSections.filter((s) => {
    if (s.minRole === "admin" && user?.role !== "admin") return false;
    return true;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border", collapsed && "justify-center")}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Cpu className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-foreground">MotorChek</span>}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
        {visibleSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <p className="px-4 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-[3px] border-primary"
                      : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <button
          onClick={toggle}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-surface-raised transition-colors"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {!collapsed && <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>}
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-surface-raised transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
              {user.avatarInitials}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <span className="text-xs text-muted-foreground bg-surface-raised px-1.5 py-0.5 rounded capitalize">
                {user.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-card shadow-sm border border-border"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] max-w-[80vw] bg-sidebar transform transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 text-muted-foreground" aria-label="Close navigation">
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          "hidden lg:flex flex-col h-full border-r border-sidebar-border bg-sidebar shrink-0 transition-all duration-300 relative",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute bottom-[200px] w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground",
            collapsed ? "left-[52px]" : "left-[228px]"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("w-3 h-3 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>
    </>
  );
}
