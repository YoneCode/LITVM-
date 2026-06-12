"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { PRIVY_APP_ID, litvmChain } from "@/lib/chain";

/**
 * Privy auth, scoped to the LitVM testnet only.
 * Theme is wired to the product's Warm Stone Dark tokens so the modal
 * matches the dashboard rather than looking like a bolted-on widget.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        defaultChain: litvmChain,
        supportedChains: [litvmChain],
        // wallet-first product: external injected wallets + a Privy embedded fallback
        loginMethods: ["wallet", "email"],
        embeddedWallets: { createOnLogin: "users-without-wallets" },
        appearance: {
          theme: "dark",
          accentColor: "#e08a3c",
          logo: undefined,
          showWalletLoginFirst: true,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
