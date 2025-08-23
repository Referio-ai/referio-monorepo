'use client'

import { useUser } from "@propelauth/nextjs/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectUserPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Get user type from PropelAuth user metadata
      const userType = (user.properties?.metadata as any)?.user_type as 'facilitator' | 'admin' | undefined;
      
      if (userType === 'facilitator') {
        // Redirect facilitators to their dashboard inbox
        router.push('/dashboard/inbox');
      } else if (userType === 'admin') {
        // Redirect admins to referral management dashboard
        router.push('/referral-management/');
      } else {
        // If no user type is defined, redirect to default dashboard
        console.warn(`No user_type defined for user, redirecting to default dashboard`);
        router.push('/dashboard');
      }
    } else if (!loading && !user) {
      // If no user is logged in, redirect to home page
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show redirecting message
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
}
