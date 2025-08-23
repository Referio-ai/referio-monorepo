'use client';
import React from 'react';
import { User, Mail, Phone, Building, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Facilitator, FacilitatorWithFacilities, Facility } from '../types';

interface FacilitatorCardProps {
  facilitator: FacilitatorWithFacilities;
  onEdit: (facilitator: Facilitator) => void;
  onDelete: (facilitator: Facilitator) => void;
}

const FacilitatorCard: React.FC<FacilitatorCardProps> = ({
  facilitator,
  onEdit,
  onDelete,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      suspended: { variant: 'destructive' as const, label: 'Suspended' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {facilitator.facilitator_full_name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">User</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  {facilitator.facilitator_email}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Phone className="h-4 w-4" />
                  {facilitator.facilitator_phone_number}
                </div>
                {facilitator.facilities && facilitator.facilities.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">Facilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {facilitator.facilities.map((facility, index) => (
                        <Badge key={facility.facility_id} variant="outline" className="text-xs">
                          {facility.facility_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(facilitator.facilitator_status)}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(facilitator)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(facilitator)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacilitatorCard; 