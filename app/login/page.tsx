// app/login/page.tsx
"use client";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (isConnected && balanceData) {
        const balanceInEther = parseFloat(balanceData.formatted);
        if (balanceInEther < 0) {
          setError("Unknown Error.");
          disconnect();
        } else {
          router.push("/dashboard");
        }
      }
    };

    handleRedirect();
  }, [isConnected, balanceData, disconnect, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <header className="w-full flex justify-between items-center py-4">
        <div className="flex items-center">
          <img src="/reown-logo.png" alt="logo" className="w-35 h-10 mr-2" />
          <h1 className="hidden sm:block text-xl font-bold">Reown - AppKit EVM</h1>
        </div>
      </header>
      <h2 className="my-8 text-2xl font-bold text-center">Connect Your Wallet</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid bg-gray border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-center items-center p-4">
          <w3m-button balance="hide" loadingLabel="Connecting..." />
        </div>
      </div>
    </main>
  );
}