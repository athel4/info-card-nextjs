
import { ColumnDef } from '@tanstack/react-table';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';
import PersonafyPreviewModal from '../personafysneakpeak';
import { ContactActionsCell } from './ContactActionsCell';
import { Checkbox } from '@/components/ui/checkbox';

// Helper function to calculate completeness score
// const calculateCompleteness = (contact: BusinessCardContact): number => {
//   const fields = [
//     contact.firstName,
//     contact.lastName,
//     contact.primaryEmail,
//     contact.primaryPhone,
//     contact.company,
//     contact.jobTitle,
//     contact.primaryAddress,
//     contact.primaryCity,
//     contact.primaryState,
//     contact.primaryCountry
//   ];
  
//   const filledFields = fields.filter(field => field && field.trim() !== '').length;
//   return Math.round((filledFields / fields.length) * 100);
// };

const PersonafyMenuItem = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownMenuItem onClick={() => setIsOpen(true)} className="cursor-pointer">
      <Sparkles className="mr-2 h-4 w-4" />
      PERSONAFY...
    </DropdownMenuItem>
  );
};

const PersonafyModalContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <PersonafyPreviewModal 
      open={isOpen} 
      onClose={() => setIsOpen(false)} 
    />
  );
};

export const createContactTableColumns = (
  onEdit: (contact: BusinessCardContact) => void,
  onDelete: (contact: BusinessCardContact) => void,
  onViewDetails: (contact: BusinessCardContact) => void,
  onRefresh?: () => void
): ColumnDef<BusinessCardContact>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Contact',
    cell: ({ row }) => {
      const contact = row.original;
      const displayName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown';
      const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
      
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{displayName}</div>
            {(contact.secondaryFirstName || contact.tertiaryFirstName) && (
              <div className="flex gap-1 mt-1">
                {contact.secondaryFirstName && (
                  <Badge variant="secondary" className="text-xs">
                    {[contact.secondaryFirstName, contact.secondaryLastName].filter(Boolean).join(' ')}
                  </Badge>
                )}
                {contact.tertiaryFirstName && (
                  <Badge variant="secondary" className="text-xs">
                    {[contact.tertiaryFirstName, contact.tertiaryLastName].filter(Boolean).join(' ')}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'company',
    header: 'Company',
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div>
          <div className="font-medium">{contact.company || '-'}</div>
          {contact.jobTitle && (
            <div className="text-sm text-muted-foreground">{contact.jobTitle}</div>
          )}
          {contact.department && (
            <div className="text-xs text-muted-foreground">{contact.department}</div>
          )}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'outreach_actions',
    header: 'Outreach',
    cell: ({ row }) => {
      const contact = row.original;
      return <ContactActionsCell contact={contact} onRefresh={onRefresh} />;
    },
  },
  // {
  //   accessorKey: 'completeness_score',
  //   header: 'Completeness',
  //   cell: ({ row }) => {
  //     const score = calculateCompleteness(row.original);
      
  //     return (
  //       <div className="w-20">
  //         <Progress value={score} className="h-2" />
  //         <div className="text-xs text-center mt-1">{score}%</div>
  //       </div>
  //     );
  //   },
  //   enableSorting: true,
  // },
  {
    accessorKey: 'createdAt',
    header: 'Added',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm">
          {date.toLocaleDateString()}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const contact = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:shadow-md cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(contact)} className="cursor-pointer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => {
              // Use timeout to ensure dropdown closes first
              setTimeout(() => {
                if (globalPersonafyModal) {
                  globalPersonafyModal.setIsOpen(true);
                }
              }, 100);
            }}>
              <Sparkles className="mr-2 h-4 w-4" />
              PERSONAFY...
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem onClick={() => onEdit(contact)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Contact
            </DropdownMenuItem> */}
            <DropdownMenuItem 
              onClick={() => onDelete(contact)}
              className="text-red-600 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Export modal container for use in parent component
export const ContactTablePersonafyModal = PersonafyModalContainer;
