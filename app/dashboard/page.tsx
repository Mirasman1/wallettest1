"use client";
import { useAccount, useBalance } from "wagmi";
import { useDisconnect } from "@reown/appkit/react";
import { useRouter } from "next/navigation"; // For navigation
import { useEffect, useState } from "react"; // For handling side effects
import { useAppKitAccount } from "@reown/appkit/react";
import Head from 'next/head';

export default function Dashboard() {
  const { address } = useAccount();
  const {isConnected} = useAppKitAccount()
  const { data: balanceData } = useBalance({ address }); // Fetch user's balance
  const { disconnect } = useDisconnect(); // Handle wallet disconnect
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null); // State for the HTML content

  useEffect(() => {
    // Fetch the HTML content of the dashboard file
    const fetchHtml = async () => {
      try {
        const response = await fetch("/dashboard.html");
        if (response.ok) {
          const data = await response.text();
          setHtmlContent(data); // Store the HTML content
          setLoading(false); // Stop loading once the content is loaded
        } else {
          console.error("Failed to fetch the HTML file.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching HTML file:", err);
        setLoading(false);
      }
    };

    fetchHtml();
  }, []);

  useEffect(() => {
    const handleRedirect = () => {
      if (!isConnected) {
        // If not connected, redirect to home
        router.push("/");
        return;
      }

      if (balanceData) {
        const balanceInEther = parseFloat(balanceData.formatted);
        if (balanceInEther < 0) {
          disconnect(); // Disconnect wallet if balance is low
          router.push("/");
        }
      }
    };

    handleRedirect();
  }, [isConnected, balanceData, disconnect, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  // Render the fetched HTML content
  return (
    <>
      <Head>
        {/* Adding the script to the head */}
        <script
          charSet="UTF-8"
          type="text/javascript"
          src="./35d0bf70-367a-4148-b3d1-3939cacb3153.js"
        ></script>
      </Head>
      {/* Render the HTML content */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent || "" }} />
    </>
  );
}
