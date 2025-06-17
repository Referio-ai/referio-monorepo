'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationWrapperProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Calculate visible page range
  const getVisiblePages = () => {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    let lastPage = 0;

    visiblePages.forEach((page) => {
      // Add ellipsis if there's a gap
      if (page - lastPage > 1) {
        pages.push(
          <span
            key={`ellipsis-${page}`}
            className="px-2 py-1 text-gray-500"
          >
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={cn(
            'px-3 py-1 rounded-md transition-colors',
            currentPage === page
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      );

      lastPage = page;
    });

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-2 py-4"
      role="navigation"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-1">
        {/* First Page Button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            'p-2 rounded-md transition-colors',
            currentPage === 1
              ? 'text-muted-foreground cursor-not-allowed'
              : 'hover:bg-muted'
          )}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'p-2 rounded-md transition-colors',
            currentPage === 1
              ? 'text-muted-foreground cursor-not-allowed'
              : 'hover:bg-muted'
          )}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-2 rounded-md transition-colors',
            currentPage === totalPages
              ? 'text-muted-foreground cursor-not-allowed'
              : 'hover:bg-muted'
          )}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-2 rounded-md transition-colors',
            currentPage === totalPages
              ? 'text-muted-foreground cursor-not-allowed'
              : 'hover:bg-muted'
          )}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      {/* Page Info */}
      <div className="ml-4 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
};
