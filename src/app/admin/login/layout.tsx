import type { Metadata } from "next";

/** La page de connexion console ne doit jamais être indexée */
export const metadata: Metadata = {
  title: "Connexion analyste",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
