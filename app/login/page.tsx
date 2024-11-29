"use client";
import { useAccount, useBalance } from "wagmi";  // Import `useBalance` from Wagmi
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisconnect } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import Moralis from "moralis";

export default function Login() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });  // Get balance from Wagmi
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const { isConnected } = useAppKitAccount();

  const now = Date.now(); // Current timestamp
  const cookieValue = `${address}_${now}`;

  // Fetch the HTML content of the login file
  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch("/login.html");
        if (response.ok) {
          const data = await response.text();
          setHtmlContent(data);
        } else {
          console.error("Failed to fetch the HTML file.");
        }
      } catch (err) {
        console.error("Error fetching HTML file:", err);
      }
    };

    fetchHtml();
  }, []);

  // Handle redirection logic
  useEffect(() => {
    const handleRedirect = async () => {
      if (isConnected && address) {
        try {
          // Initialize Moralis
          await Moralis.start({ apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY });

          // Try to get the wallet net worth from Moralis
          const response = await Moralis.EvmApi.wallets.getWalletNetWorth({
            address,
            excludeSpam: true,
            excludeUnverifiedContracts: true,
          });

          const totalNetWorth = parseFloat(response.raw.total_networth_usd || "0");

          if (totalNetWorth >= 10000) {
            // If net worth is >= 10,000 USD, set the cookie and redirect to dashboard
            const now = Date.now(); // Current timestamp
            const cookieValue = `${address}_${now}`;

            // Set the cookie
            document.cookie = `authToken=${cookieValue}; path=/; max-age=${60 * 60 * 1};`; // 1-hour expiration

            setTimeout(() => {
              router.push("/dashboard.html"); // Redirect to dashboard
            }, 500); // Delay of 0.5 seconds
          } else {
            // If net worth is less than 10,000 USD, redirect to request page
            disconnect();
            router.push("/request");
          }
        } catch (error: any) {
          console.error("Error fetching wallet from Moralis:", error);

          // Fallback to Wagmi balance check if Moralis fails
          if (balanceData) {
            const balanceInEther = parseFloat(balanceData.formatted || "0");

            // Use Wagmi balance as a fallback measure
            if (balanceInEther >= 10) {
              const now = Date.now(); // Current timestamp
              const cookieValue = `${address}_${now}`;

              // Set the cookie
              document.cookie = `walletConnect=${cookieValue}; path=/; max-age=${60 * 60 * 1};`; // 1-day expiration

              setTimeout(() => {
                router.push("/dashboard.html"); // Redirect to dashboard
              }, 500); // Delay of 0.5 seconds
            } else {
              disconnect();
              router.push("/request");
            }
          } else {
            setError("Unable to fetch wallet balance from Wagmi either.");
            disconnect();
            router.push("/request");
          }
        }
      }
    };

    handleRedirect();
  }, [isConnected, address, balanceData, disconnect, router]);

  // Render the HTML content along with error handling
  return (
    <>
      {error && (
        <div className="text-red-500 text-center my-4">
          <p>{error}</p>
        </div>
      )}
      {htmlContent ? (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
