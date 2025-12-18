import React from "react";
import "./globals.css";
import ClientWrapper from "@/components/layout/client-wrapper";

export const metadata = {
  title: "Napa Valley Wineries",
  description: "Experience the finest wineries in Napa Valley",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-inter">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
