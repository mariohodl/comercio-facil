import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from '@/lib/constants'
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import ClientProviders from '@/components/shared/client-providers';
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
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
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${NunitoFont.className}`}
      >
        <Toaster />
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
