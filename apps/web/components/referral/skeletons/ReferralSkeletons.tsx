import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const ReferralListSkeleton = () => {
  return (
    <div className="w-96 border-r flex flex-col">
      {/* <div className="p-4 border-b">
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
      </div> */}
      
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

export const ReferralManagementTableSkeleton = () => {
  return (
    <div>
      {/* Filter by Batch Skeleton */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-5 h-5 bg-gray-300" />
            <Skeleton className="h-4 w-24 bg-gray-300" />
            <Skeleton className="h-10 w-48 bg-gray-300 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-40 bg-gray-300 rounded-lg" />
        </div>
      </div>

      {/* Total Count & Pagination Controls Skeleton */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 bg-gray-300 rounded-full" />
              <Skeleton className="h-6 w-32 bg-gray-300" />
            </div>
            <Skeleton className="h-6 w-40 bg-gray-300 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-48 bg-gray-300" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-8 bg-gray-300" />
              <Skeleton className="h-8 w-20 bg-gray-300 rounded-md" />
              <Skeleton className="h-4 w-16 bg-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left">
                  <Skeleton className="h-4 w-24 bg-gray-300" />
                </th>
                <th className="px-4 lg:px-6 py-4 text-left hidden md:table-cell">
                  <Skeleton className="h-4 w-20 bg-gray-300" />
                </th>
                <th className="px-4 lg:px-6 py-4 text-left">
                  <Skeleton className="h-4 w-16 bg-gray-300" />
                </th>
                <th className="px-4 lg:px-6 py-4 text-left hidden lg:table-cell">
                  <Skeleton className="h-4 w-16 bg-gray-300" />
                </th>
                <th className="px-4 lg:px-6 py-4 text-left">
                  <Skeleton className="h-4 w-20 bg-gray-300" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24 bg-gray-300" />
                        <Skeleton className="w-6 h-6 bg-gray-300 rounded-lg" />
                      </div>
                      <Skeleton className="h-3 w-20 bg-gray-300 mt-1 md:hidden" />
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <Skeleton className="h-4 w-20 bg-gray-300" />
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm min-w-0">
                      <Skeleton className="h-4 w-32 bg-gray-300 mb-1" />
                      <Skeleton className="h-4 w-28 bg-gray-300" />
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <Skeleton className="h-6 w-16 bg-gray-300 rounded-full" />
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 lg:gap-2">
                      <Skeleton className="h-8 w-24 bg-gray-300 rounded-lg" />
                      <Skeleton className="w-8 h-8 bg-gray-300 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Skeleton */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <Skeleton className="h-8 w-64 bg-gray-300" />
        </div>
      </div>
    </div>
  );
}; 