import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/hooks/use-user";
import ClientOnly from "@/components/layout/ClientOnly";

export const metadata: Metadata = {
  title: "Stratagem.ai",
  description: "Strategist-grade mesh manifest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <ClientOnly>
          <UserProvider>
            <SidebarProvider>
              {children}
              <Toaster />
            </SidebarProvider>
          </UserProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
