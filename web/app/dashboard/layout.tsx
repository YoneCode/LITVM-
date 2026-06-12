import type { Metadata } from "next";
import { Providers } from "@/components/providers/Providers";
import { TxProvider } from "@/components/providers/TxProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Console — LitVM Yield",
  description: "Command center for the LitVM Yield Vault: positions, activity, governance, and health.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <TxProvider>
        <DashboardShell>{children}</DashboardShell>
      </TxProvider>
    </Providers>
  );
}
