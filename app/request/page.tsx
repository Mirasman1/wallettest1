"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Request() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage after 5 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

    // Cleanup timer if the component unmounts before 5 seconds
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        backgroundColor: "#1c1c1c",
        color: "white",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <p style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        Your connection was successful. Please wait for several seconds while we evaluate your wallet.
      </p>
    </div>
  );
}
