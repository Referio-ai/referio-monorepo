import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { OpenAPI } from "@/lib/api/client";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { AuthProvider } from "@propelauth/nextjs/client";
import { AuthRedirectProvider } from "@/components/auth/auth-redirect-provider";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

if (process.env.NODE_ENV === "production") {
  OpenAPI.BASE = "https://next-fast-turbo.vercel.app";
}

console.log("Using OpenAPI.base", OpenAPI.BASE);

export const metadata: Metadata = {
  title: "Next-Fast-Turbo",
  description: "A Next.js, FastAPI and Turbo project scaffol",
  icons: {
    icon: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
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
            <AuthRedirectProvider>{children}</AuthRedirectProvider>
          </AuthProvider>
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
