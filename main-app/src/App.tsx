import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import UserMessenger from "./projects/user/pages/UserMessenger";
// Sub-project entry points
import UserApp from "./projects/user/App";
import ArtistApp from "./projects/artist/App";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main gateway page */}
          <Route path="/" element={<Index />} />

          {/* Integrated Modules */}
          <Route path="/customer/*" element={<UserApp />} />
          <Route path="/artist/*" element={<ArtistApp />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/user/messages" element={<UserMessenger />} />
          {/* Global Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;