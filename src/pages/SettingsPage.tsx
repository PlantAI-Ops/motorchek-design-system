import { Sun, Moon, Monitor } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <AppLayout title="Settings">
      <div className="max-w-[640px] mx-auto space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">
                {user.avatarInitials}
              </div>
              <div>
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="ml-auto">
                <StatusBadge variant={user.role === "admin" ? "critical" : user.role === "supervisor" ? "warning" : "healthy"}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </StatusBadge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => { if (theme !== "light") toggle(); }}
              >
                <Sun className="w-4 h-4" /> Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => { if (theme !== "dark") toggle(); }}
              >
                <Moon className="w-4 h-4" /> Dark
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin: Account Management */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Manage user accounts across the system.</p>

              <div className="space-y-3">
                {[
                  { name: "Sarah Chen", email: "supervisor@motorchek.io", role: "supervisor" },
                  { name: "Mike Rivera", email: "tech@motorchek.io", role: "technician" },
                ].map((u) => (
                  <div key={u.email} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={u.role === "supervisor" ? "warning" : "healthy"}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </StatusBadge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success(`Password reset email sent to ${u.email}`)}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-status-critical hover:text-status-critical"
                        onClick={() => toast.success(`${u.name} has been deactivated`)}
                      >
                        Deactivate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
