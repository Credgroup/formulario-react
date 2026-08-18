import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { SidebarProvider } from "./context/SidebarContext.tsx";

const queryClient = new QueryClient();

if (
  window.location.pathname.includes("/risk/inspection") ||
  window.location.pathname.includes("/risk/recom")
) {
  const search = window.location.search;
  window.location.replace(`/#${window.location.pathname}${search}`);
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
