import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ContextProvider from "@/context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AppKit Example App",
  description: "Powered by Reown",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = {}; // Set a default initial state if needed

  return (
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider initialState={initialState}>{children}</ContextProvider>
      </body>
    </html>
  );
}
