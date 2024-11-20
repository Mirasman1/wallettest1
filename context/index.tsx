"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { wagmiAdapter, projectId } from "@/config";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum } from "@reown/appkit/networks";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "appkit-example",
  description: "AppKit Example - EVM",
  url: "https://exampleapp.com", // origin must match your domain & subdomain
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
}: {
  children: ReactNode;
}) {
  const [cookies, setCookies] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve a specific cookie or serialize the entire cookie object as a string
    const allCookies = Cookies.get(); // Returns an object of all cookies
    const cookieString = allCookies ? JSON.stringify(allCookies) : null;
  
    setCookies(cookieString);
  }, []);  

  if (!cookies) {
    // Optionally handle loading state while cookies are fetched
    return <div>Loading...</div>;
  }

  // Generate initial state from cookies
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
