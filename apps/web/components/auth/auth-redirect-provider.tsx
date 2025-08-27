'use client'

import { useUser, useRedirectFunctions } from "@propelauth/nextjs/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
//import { useAuth } from "@propelauth/nextjs/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Define public routes that don't require authentication
// Static routes
const STATIC_PUBLIC_ROUTES = ["/", "/login", "/signup", "/blog/"];

// Dynamic route patterns (using regex patterns for matching)
const DYNAMIC_PUBLIC_ROUTES = [
  /^\/r\/[^\/]+$/,  // Matches r/[slug] - single segment after /r/
  /^\/r\/[^\/]+\/$/, // Matches r/[slug]/ - with trailing slash
];

/**
 * Checks if a pathname is a public route (static or dynamic)
 */
const isPublicRoute = (pathname: string): boolean => {
  // Check static routes first
  if (STATIC_PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Check dynamic route patterns
  return DYNAMIC_PUBLIC_ROUTES.some(pattern => pattern.test(pathname));
};

// Define route mappings for different user types
const USER_TYPE_ROUTES = {
  facilitator: "/dashboard-facilitator",
  admin: "/referral-management",
} as const;

type UserType = keyof typeof USER_TYPE_ROUTES;

/**
 * Handles redirection based on user type from metadata
 */
const handleUserTypeRedirect = (
  user: any,
  pathname: string,
  router: any
) => {
  if (!user) return;

  const userType = user.properties?.metadata?.user_type as UserType;
  
  // If user type is not defined or invalid, redirect to default dashboard
  if (!userType || !USER_TYPE_ROUTES[userType]) {
    console.warn(`Invalid or missing user_type: ${userType}, redirecting to default dashboard`);
    router.push("/dashboard");
    return;
  }

  const targetRoute = USER_TYPE_ROUTES[userType];
  
  // If user is on a public route, redirect to their appropriate dashboard
  if (isPublicRoute(pathname)) {
    router.push(targetRoute);
    return;
  }

  // If user is on the wrong dashboard for their type, redirect them
  if (userType === "admin" && pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard-facilitator")) {
    router.push(targetRoute);
    return;
  }

  if (userType === "admin" && pathname.startsWith("/dashboard-facilitator")) {
    router.push(targetRoute);
    return;
  }

  // If admin user is on dashboard, redirect to referral-management
  if (userType === "admin" && pathname === "/dashboard") {
    router.push("/referral-management");
    return;
  }
};

/**
 * Checks if user should be redirected based on their type
 */
const shouldRedirectUser = (user: any, pathname: string): boolean => {
  if (!user) return false;
  
  const userType = user.properties?.metadata?.user_type as UserType;
  
  // If user type is invalid, they should be redirected
  if (!userType || !USER_TYPE_ROUTES[userType]) {
    return !isPublicRoute(pathname);
  }

  const targetRoute = USER_TYPE_ROUTES[userType];
  
  // Check if user is on wrong dashboard type
  if (userType === "admin" && pathname.startsWith("/dashboard") && !pathname.startsWith("/refere-facilitator")) {
    return true;
  }

  // Check if admin user is on dashboard and should be redirected to referral-management
  if (userType === "admin" && pathname === "/dashboard") {
    return true;
  }

  if (userType === "facilitator" && pathname.startsWith("/referral-management")) {
    return true;
  }

  // Check if user is on public route and should be redirected to their dashboard
  if (isPublicRoute(pathname)) {
    return true;
  }

  return false;
};

export function AuthRedirectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = new QueryClient();
  console.log("user", user);

  useEffect(() => {
    if (!loading) {
      // If user is not logged in and trying to access a protected route
      if (!user && !isPublicRoute(pathname)) {
        //redirect to login page of propelauth
        const loginUrl = `${process.env.NEXT_PUBLIC_AUTH_URL}/login?redirectTo=${pathname}`;
        router.push(loginUrl);
        return;
      }
      
      // If user is logged in, handle user type-based redirections
      if (user) {
        // If user is trying to access auth pages, redirect to appropriate dashboard
        if (pathname === "/login" || pathname === "/signup") {
          handleUserTypeRedirect(user, pathname, router);
          return;
        }

        // Handle user type-based routing for protected routes
        if (!isPublicRoute(pathname)) {
          handleUserTypeRedirect(user, pathname, router);
          return;
        }
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading state while checking authentication OR if user should be redirected
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
} 