"use client";
import { useAccount, useBalance} from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisconnect } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";

export default function Login() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const {isConnected} = useAppKitAccount()

  // Generate the cookie value (wallet address + timestamp)
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
      if (isConnected && balanceData) {
        const balanceInEther = parseFloat(balanceData.formatted);
        if (balanceInEther < 0) {
          setError("Unknown Error.");
          disconnect();
          router.push("/request")
        } else {
          // Generate the cookie value (wallet address + timestamp)
          const now = Date.now(); // Current timestamp
          const cookieValue = `${address}_${now}`;
    
          // Set the cookie
          document.cookie = `authToken=${cookieValue}; path=/; max-age=${60 * 60 * 1};`; // 1-day expiration

          setTimeout(() => {
            router.push("/dashboard.html"); // Redirect to dashboard
          }, 500); // Delay of 0.5 seconds
        }
      }
    };

    handleRedirect();
  }, [isConnected, balanceData, disconnect, router]);

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