
import React, { useState } from 'react';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Building, Calendar, ExternalLink, Trash2, Edit, RefreshCw, Sparkles } from 'lucide-react';
import PersonafyPreviewModal from '../personafysneakpeak';
import { ContactActionsCell } from './ContactActionsCell';
import { useToast } from '@/hooks/use-toast';

interface MobileContactTableProps {
  contacts: BusinessCardContact[];
  onEditContact: (contact: BusinessCardContact) => void;
  onViewContact: (contact: BusinessCardContact) => void;
  onDeleteContact: (contact: BusinessCardContact) => void;
  selectedContacts: string[];
  onSelectContact: (contactId: string) => void;
  onRefresh?: () => void;
}

const PersonafyMobileMenuItem = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <DropdownMenuItem onClick={() => setIsOpen(true)} className="py-3 cursor-pointer hover:shadow-sm">
        <Sparkles className="mr-3 h-4 w-4" />
        PERSONAFY...
      </DropdownMenuItem>
      <PersonafyPreviewModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const MobileContactTable: React.FC<MobileContactTableProps> = ({
  contacts,
  onEditContact,
  onViewContact,
  onDeleteContact,
  selectedContacts,
  onSelectContact,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart({
        y: e.touches[0].clientY,
        time: Date.now()
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStart.y;
    
    if (distance > 0 && distance < 100) {
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast({
          title: "Refreshed",
          description: "Contacts updated",
        });
      } catch (error) {
        toast({
          title: "Refresh failed",
          description: "Unable to refresh contacts",
          variant: "destructive",
        });
      } finally {
        setIsRefreshing(false);
      }
    }
    setTouchStart(null);
    setPullDistance(0);
  };

  return (
    <div 
      className="space-y-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full transition-transform duration-200 ease-out z-10"
          style={{ transform: `translateX(-50%) translateY(${Math.min(pullDistance - 60, 0)}px)` }}
        >
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}
      {contacts.map((contact) => {
        const displayName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown';
        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
        const isSelected = selectedContacts.includes(contact.id);

        return (
          <Card key={contact.id} className={`${isSelected ? 'ring-2 ring-primary' : ''} transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectContact(contact.id)}
                    className="mt-1 h-5 w-5 rounded border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    style={{ minWidth: '20px', minHeight: '20px' }}
                  />
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg">{displayName}</div>
                    
                    {contact.company && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Building className="h-3 w-3" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                    
                    {contact.jobTitle && (
                      <div className="text-sm text-muted-foreground">{contact.jobTitle}</div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 touch-manipulation hover:shadow-md cursor-pointer" style={{ minWidth: '44px', minHeight: '44px' }}>
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onViewContact(contact)} className="py-3 cursor-pointer hover:shadow-sm">
                      <ExternalLink className="mr-3 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {/* <PersonafyMobileMenuItem /> */}
                    {/* <DropdownMenuItem onClick={() => onEditContact(contact)} className="py-3">
                      <Edit className="mr-3 h-4 w-4" />
                      Edit Contact
                    </DropdownMenuItem> */}
                    <DropdownMenuItem 
                      onClick={() => onDeleteContact(contact)}
                      className="text-red-600 py-3 cursor-pointer hover:shadow-sm"
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3">
                <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                  <ContactActionsCell contact={contact} />
                </div>
              </div>

              {(contact.secondaryFirstName || contact.tertiaryFirstName) && (
                <div className="flex gap-1 mt-3">
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
