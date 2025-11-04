import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from '@/lib/constants'
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import ClientProviders from '@/components/shared/client-providers';
import { Toaster } from "sonner";
import "./globals.css";
import "../config/index";





const NunitoFont = Nunito({
  subsets: ["latin"],
});




export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `${APP_NAME}. ${APP_SLOGAN}`,
  },
  description: APP_DESCRIPTION,
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body
        className={`${NunitoFont.className}`}
      >
        <Toaster />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
