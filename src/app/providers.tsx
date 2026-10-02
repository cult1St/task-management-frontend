"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/auth-context";
import { WorkspaceProvider } from "@/context/workspace-context";
import { ChatRealtimeProvider } from "@/context/chat-realtime-context";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkspaceProvider>
          <ChatRealtimeProvider>{children}</ChatRealtimeProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;
