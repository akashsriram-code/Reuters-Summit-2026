import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reuters Summit 2026 Dashboard",
  description: "A collaborative summit guest scheduling dashboard powered by Firebase Firestore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
