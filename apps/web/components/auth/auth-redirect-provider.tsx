'use client'

import { useUser, useRedirectFunctions } from "@propelauth/nextjs/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
//import { useAuth } from "@propelauth/nextjs/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export function AuthRedirectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = new QueryClient();

  useEffect(() => {
    if (!loading) {
      // If user is not logged in and trying to access a protected route
      if (!user && !PUBLIC_ROUTES.includes(pathname)) {
        //redirect to login page of propelauth
        const loginUrl = `${process.env.NEXT_PUBLIC_AUTH_URL}/login?redirectTo=${pathname}`;
        router.push(loginUrl);
      }
      
      // If user is logged in and trying to access auth pages
      if (user && (pathname === "/login" || pathname === "/signup")) {
        router.push("/dashboard"); // or your default authenticated route
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
} 