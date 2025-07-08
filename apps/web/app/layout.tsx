import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { OpenAPI } from "@/lib/api/client";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { AuthProvider } from "@propelauth/nextjs/client";
import { AuthRedirectProvider } from "@/components/auth/auth-redirect-provider";
import { RedirectToLogin } from "@propelauth/nextjs/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import 'sweetalert2/src/sweetalert2.scss'

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

if (process.env.NODE_ENV === "production") {
  OpenAPI.BASE = "https://next-fast-turbo.vercel.app";
}

console.log("Using OpenAPI.base", OpenAPI.BASE);

export const metadata: Metadata = {
  title: "Referio.ai",
  description: "AI-Powered Referral Management Platform",
  icons: {
    icon: ["/logo.png"],
    apple: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {

  const queryClient = new QueryClient();


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable, "bg-background font-sans")}>

        <ThemeProvider
          attribute="class"
          defaultTheme=""
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider authUrl={process.env.NEXT_PUBLIC_AUTH_URL!}>
            <AuthRedirectProvider>
              {children}
              </AuthRedirectProvider>
          </AuthProvider>
          <TailwindIndicator />
        </ThemeProvider>

      </body>
    </html>
  );
}
