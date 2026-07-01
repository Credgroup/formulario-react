import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { SidebarProvider } from "./context/SidebarContext.tsx";

const queryClient = new QueryClient();

// Redirect non-hash /risk/inspection requests to HashRouter format
if (window.location.pathname.includes("/risk/inspection")) {
  const search = window.location.search;
  window.location.replace(`/#/risk/inspection${search}`);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <SidebarProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster position="bottom-center" />
        </QueryClientProvider>
      </SidebarProvider>
    </HashRouter>
  </StrictMode>
);
