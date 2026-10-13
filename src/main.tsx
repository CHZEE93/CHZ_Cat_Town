import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient as client } from "./api/queryClient";
import { useAuth } from "./stores/auth";
import App from "./App";
import "./style.css";
void useAuth.getState().refresh();
window.addEventListener("session-expired", () => useAuth.getState().expire());
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
