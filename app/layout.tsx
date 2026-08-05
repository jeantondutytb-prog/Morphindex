import type { Metadata } from "next";
import "./globals.css";
import { CrispChat } from "@/components/crisp-chat";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "MorphIndex",
  description: "Analyse faciale en français",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={fontVars}>
      <body className="bg-bg text-text antialiased">
        {children}
        <CrispChat />
      </body>
    </html>
  );
}
