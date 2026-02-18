"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/auth-context";

const queryClient = new QueryClient();

const Providers = ({ children }: {children: React.ReactNode}) => {
    return(
        <QueryClientProvider client={queryClient} >
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default Providers;
