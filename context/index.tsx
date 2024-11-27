// context/index.tsx
"use client";

import { useEffect } from "react";
import { wagmiAdapter, projectId } from "@/config";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "appkit-example",
  description: "AppKit Example - EVM",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  metadata: metadata,
  features: {
    analytics: true,
    email: false,
    socials: [],
    emailShowWallets: true,
  },
  themeMode: "dark",
});

export default function ContextProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: any; // Accept initial state as a prop
}) {
  // No need to handle cookies

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}