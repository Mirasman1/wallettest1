'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDisconnect } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";

export default function Logout() {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected) {
      // Disconnect the wallet
      disconnect();
    }

    // Delete the auth_token cookie
    document.cookie = "walletConnect=; path=/; max-age=0;";

    // Redirect to the homepage
    router.push('/');
  }, [isConnected, disconnect, router]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
}
