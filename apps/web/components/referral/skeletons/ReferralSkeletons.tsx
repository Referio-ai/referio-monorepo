import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const ReferralListSkeleton = () => {
  return (
    <div className="w-96 border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24 bg-gray-500" />
          <Skeleton className="h-9 w-28 bg-gray-500" />
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 bg-gray-500" />
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-24 bg-gray-500" />
          <Skeleton className="h-8 w-32 bg-gray-500" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-5 w-32 bg-gray-500" />
              <Skeleton className="h-5 w-20 bg-gray-500" />
            </div>
            <Skeleton className="h-4 w-48 mb-2 bg-gray-500" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-24 bg-gray-500" />
              <Skeleton className="h-3 w-24 bg-gray-500" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-5 w-16 bg-gray-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReferralDetailSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-gray-500" />
          <Skeleton className="h-4 w-64 bg-gray-500" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40 bg-gray-500" />
          <Skeleton className="h-9 w-32 bg-gray-500" />
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-500" />
                    <Skeleton className="h-5 w-40 bg-gray-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-500" />
                    <Skeleton className="h-5 w-40 bg-gray-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-gray-500" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full bg-gray-500" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const HeaderSkeleton = () => {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <Skeleton className="h-6 w-48 bg-gray-500" />
      
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-64 bg-gray-500" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full bg-gray-500" />
          <Skeleton className="h-4 w-24 bg-gray-500" />
          <Skeleton className="h-4 w-4 bg-gray-500" />
        </div>
      </div>
    </header>
  );
};

export const NewReferralFormSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={i === 0 || i === 4 ? "col-span-2" : ""}>
            <Skeleton className="h-4 w-20 mb-1 bg-gray-500" />
            <Skeleton className="h-8 w-full bg-gray-500" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Skeleton className="h-9 w-24 bg-gray-500" />
        <Skeleton className="h-9 w-24 bg-gray-500" />
      </div>
    </div>
  );
}; 