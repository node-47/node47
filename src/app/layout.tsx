import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "NODE.47 — Trader Intelligence · Analyses sportives & décisions de marché",
    template: "%s · NODE.47",
  },
  description:
    "Sélections sportives publiées avec méthode : les marchés retenus, les statistiques qui comptent et la synthèse de chaque décision — sans bruit inutile.",
  keywords: [
    "analyses sportives",
    "sélections",
    "football",
    "basketball",
    "tennis",
    "marchés sportifs",
    "NODE.47",
  ],
  applicationName: "NODE.47",
  openGraph: {
    title: "NODE.47 — Trader Intelligence · Analyses sportives & décisions de marché",
    description:
      "Les marchés retenus, les statistiques qui comptent et la synthèse de chaque décision — sans bruit inutile. Football, Basketball, Tennis.",
    siteName: "NODE.47",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NODE.47 — Trader Intelligence · Analyses sportives & décisions de marché",
    description:
      "Les marchés retenus, les statistiques qui comptent et la synthèse de chaque décision — sans bruit inutile.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${grotesk.variable} ${inter.variable} ${jetbrains.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
