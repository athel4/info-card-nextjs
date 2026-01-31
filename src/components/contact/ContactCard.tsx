
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Linkedin,
  Edit,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { ContactField } from '../ContactField';

interface ContactCardProps {
  contact: BusinessCardContact;
  onEdit?: (contact: BusinessCardContact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFullName = (first?: string, middle?: string, last?: string) => {
    return [first, middle, last].filter(Boolean).join(' ') || undefined;
  };

  const getFullAddress = (address?: string, city?: string, state?: string, country?: string, postal?: string) => {
    const parts = [address, city, state, country, postal].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : undefined;
  };

  const primaryName = getFullName(contact.firstName, contact.middleName, contact.lastName);
  const secondaryName = getFullName(contact.secondaryFirstName, contact.secondaryMiddleName, contact.secondaryLastName);
  const tertiaryName = getFullName(contact.tertiaryFirstName, contact.tertiaryMiddleName, contact.tertiaryLastName);

  const primaryAddress = getFullAddress(
    contact.primaryAddress, 
    contact.primaryCity, 
    contact.primaryState, 
    contact.primaryCountry, 
    contact.primaryPostalCode
  );
  const secondaryAddress = getFullAddress(
    contact.secondaryAddress, 
    contact.secondaryCity, 
    contact.secondaryState, 
    contact.secondaryCountry, 
    contact.secondaryPostalCode
  );
  const tertiaryAddress = getFullAddress(
    contact.tertiaryAddress, 
    contact.tertiaryCity, 
    contact.tertiaryState, 
    contact.tertiaryCountry, 
    contact.tertiaryPostalCode
  );

  const hasMultipleEntries = secondaryName || tertiaryName || 
    contact.secondaryEmail || contact.tertiaryEmail ||
    contact.secondaryPhone || contact.tertiaryPhone ||
    contact.secondaryWebsite || contact.tertiaryWebsite ||
    secondaryAddress || tertiaryAddress;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {(primaryName || 'U').charAt(0).toUpperCase()}
              </div>
              {primaryName || 'Unknown Contact'}
            </CardTitle>
            {contact.company && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span>{contact.jobTitle ? `${contact.jobTitle} at ${contact.company}` : contact.company}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasMultipleEntries && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="cursor-pointer hover:shadow-md"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(contact)} className="hover:shadow-md cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasMultipleEntries ? (
          // Simple view for single entries
          <div className="space-y-3">
            <ContactField
              icon={Mail}
              label="Email"
              value={contact.primaryEmail}
              iconColor="text-blue-500"
            />
            <ContactField
              icon={Phone}
              label="Phone"
              value={contact.primaryPhone}
              iconColor="text-green-500"
            />
            <ContactField
              icon={Globe}
              label="Website"
              value={contact.primaryWebsite}
              iconColor="text-purple-500"
            />
            <ContactField
              icon={MapPin}
              label="Address"
              value={primaryAddress}
              iconColor="text-red-500"
            />
            <ContactField
              icon={Linkedin}
              label="LinkedIn"
              value={contact.linkedinUrl}
              iconColor="text-blue-600"
            />
          </div>
        ) : (
          // Tabbed view for multiple entries
          <Tabs defaultValue="primary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="primary">Primary</TabsTrigger>
              {(secondaryName || contact.secondaryEmail || contact.secondaryPhone || contact.secondaryWebsite || secondaryAddress) && (
                <TabsTrigger value="secondary">Secondary</TabsTrigger>
              )}
              {(tertiaryName || contact.tertiaryEmail || contact.tertiaryPhone || contact.tertiaryWebsite || tertiaryAddress) && (
                <TabsTrigger value="tertiary">Tertiary</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="primary" className="space-y-3 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">Primary Contact</Badge>
                {primaryName && <span className="text-sm font-medium">{primaryName}</span>}
              </div>
              <ContactField icon={Mail} label="Email" value={contact.primaryEmail} iconColor="text-blue-500" />
              <ContactField icon={Phone} label="Phone" value={contact.primaryPhone} iconColor="text-green-500" />
              <ContactField icon={Globe} label="Website" value={contact.primaryWebsite} iconColor="text-purple-500" />
              <ContactField icon={MapPin} label="Address" value={primaryAddress} iconColor="text-red-500" />
            </TabsContent>
            
            {(secondaryName || contact.secondaryEmail || contact.secondaryPhone || contact.secondaryWebsite || secondaryAddress) && (
              <TabsContent value="secondary" className="space-y-3 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Secondary Contact</Badge>
                  {secondaryName && <span className="text-sm font-medium">{secondaryName}</span>}
                </div>
                <ContactField icon={Mail} label="Email" value={contact.secondaryEmail} iconColor="text-blue-500" />
                <ContactField icon={Phone} label="Phone" value={contact.secondaryPhone} iconColor="text-green-500" />
                <ContactField icon={Globe} label="Website" value={contact.secondaryWebsite} iconColor="text-purple-500" />
                <ContactField icon={MapPin} label="Address" value={secondaryAddress} iconColor="text-red-500" />
              </TabsContent>
            )}
            
            {(tertiaryName || contact.tertiaryEmail || contact.tertiaryPhone || contact.tertiaryWebsite || tertiaryAddress) && (
              <TabsContent value="tertiary" className="space-y-3 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Tertiary Contact</Badge>
                  {tertiaryName && <span className="text-sm font-medium">{tertiaryName}</span>}
                </div>
                <ContactField icon={Mail} label="Email" value={contact.tertiaryEmail} iconColor="text-blue-500" />
                <ContactField icon={Phone} label="Phone" value={contact.tertiaryPhone} iconColor="text-green-500" />
                <ContactField icon={Globe} label="Website" value={contact.tertiaryWebsite} iconColor="text-purple-500" />
                <ContactField icon={MapPin} label="Address" value={tertiaryAddress} iconColor="text-red-500" />
              </TabsContent>
            )}
          </Tabs>
        )}
        
        {/* Common fields */}
        <div className="border-t pt-3 mt-4 space-y-3">
          <ContactField
            icon={Linkedin}
            label="LinkedIn"
            value={contact.linkedinUrl}
            iconColor="text-blue-600"
          />
          {contact.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Notes</div>
              <div className="text-sm">{contact.notes}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
