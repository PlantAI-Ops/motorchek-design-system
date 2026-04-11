import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import MotorListPage from "./pages/MotorListPage.tsx";
import MotorDetailPage from "./pages/MotorDetailPage.tsx";
import MotorCreatePage from "./pages/MotorCreatePage.tsx";
import SpecListPage from "./pages/SpecListPage.tsx";
import SpecDetailPage from "./pages/SpecDetailPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/motors" element={<ProtectedRoute><MotorListPage /></ProtectedRoute>} />
              <Route path="/motors/new" element={<ProtectedRoute allowedRoles={["admin"]}><MotorCreatePage /></ProtectedRoute>} />
              <Route path="/motors/:id" element={<ProtectedRoute><MotorDetailPage /></ProtectedRoute>} />
              <Route path="/specs" element={<ProtectedRoute><SpecListPage /></ProtectedRoute>} />
              <Route path="/specs/:id" element={<ProtectedRoute><SpecDetailPage /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
