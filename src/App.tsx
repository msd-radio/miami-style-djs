import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DJAuth from "./pages/DJAuth";
import DJDashboard from "./pages/DJDashboard";
import DJOnboarding from "./pages/DJOnboarding";
import DJOnboardingGuide from "./pages/DJOnboardingGuide";
import DJRegistration from "./pages/DJRegistration";
import BookDJ from "./pages/BookDJ";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import DJProfile from "./pages/DJProfile";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dj-portal" element={<DJAuth />} />
          <Route path="/dj-portal/dashboard" element={<ProtectedRoute><DJDashboard /></ProtectedRoute>} />
          <Route path="/dj-portal/onboarding" element={<ProtectedRoute><DJOnboarding /></ProtectedRoute>} />
          <Route path="/dj-portal/onboarding-guide" element={<ProtectedRoute><DJOnboardingGuide /></ProtectedRoute>} />
          <Route path="/dj-registration" element={<DJRegistration />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dj/:djName" element={<DJProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
