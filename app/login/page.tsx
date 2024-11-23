"use client";
import { useAccount, useBalance} from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisconnect } from "@reown/appkit/react";

export default function Login() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

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
          router.push("/dashboard.html");
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