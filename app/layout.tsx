import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from '@/lib/constants'
import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import ClientProviders from '@/components/shared/client-providers';
import { Toaster } from "sonner";
import "./globals.css";
import "../config/index";



const PlayFairFont = Playfair_Display({
  subsets: ["latin"],
});

const lora = Lora({
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
  console.log(PlayFairFont)
  return (
    <html lang='es' suppressHydrationWarning>
      <body
        className={`${lora.className}`}
      >
        <Toaster />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
