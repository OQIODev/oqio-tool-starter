import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OQIO Tool",
  description: "Outil interne OQIO",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
