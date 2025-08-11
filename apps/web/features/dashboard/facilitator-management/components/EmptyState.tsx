'use client';
import React from 'react';
import { User, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasFilters: boolean;
  onAddFacilitator: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hasFilters,
  onAddFacilitator,
}) => {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No facilitators found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {hasFilters
            ? 'Try adjusting your filters to see more results.'
            : 'Get started by adding your first facilitator.'}
        </p>
        {!hasFilters && (
          <Button onClick={onAddFacilitator}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Facilitator
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState; 