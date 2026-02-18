import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Canvas - Generate Images with AI",
  description: "Generate beautiful images using AI with Replicate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
