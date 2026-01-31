
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { useApplicationServices } from '../../presentation/contexts/ApplicationServiceContext';
import { useAuth } from '../../presentation/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContactEditModalProps {
  contact: BusinessCardContact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ContactEditModal: React.FC<ContactEditModalProps> = ({
  contact,
  isOpen,
  onClose,
  onSave,
}) => {
  const { contactService } = useApplicationServices();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<Partial<BusinessCardContact>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({});
    }
  }, [contact?.id]); // Only trigger when contact ID changes, not on every contact update

  // const calculateCompleteness = (data: Partial<BusinessCardContact>): number => {
  //   const fields = [
  //     data.firstName, data.lastName, data.primaryEmail, data.primaryPhone,
  //     data.company, data.jobTitle, data.department, data.primaryAddress,
  //     data.primaryCity, data.primaryState, data.primaryCountry, data.primaryWebsite,
  //     data.secondaryEmail, data.secondaryPhone, data.linkedinUrl, data.notes,
  //     data.middleName, data.secondaryFirstName, data.tertiaryFirstName, data.primaryPostalCode
  //   ];
    
  //   const filledFields = fields.filter(field => field && field.trim() !== '').length;
  //   return Math.round((filledFields / fields.length) * 100);
  // };

  const handleSave = async () => {
    if (!formData) return;

    setIsLoading(true);
    try {
      if (contact) {
        // Update existing contact
        await contactService.updateContact(contact.id, formData);
        toast({
          title: "Contact updated",
          description: "The contact has been successfully updated.",
        });
      } else {
        // Create new contact
        if (!user?.id) throw new Error('User not authenticated');
        await contactService.createContact(user.id, formData);
        toast({
          title: "Contact created",
          description: "The contact has been successfully created.",
        });
      }
      onSave();
      onClose();
    } catch (error) {
      //console.log('athX1:',error)
      toast({
        title: "Error",
        description: contact ? "Failed to update contact. Please try again." : "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = useCallback((field: keyof BusinessCardContact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  //const completenessScore = calculateCompleteness(formData);

  // Allow modal to open even without contact (for creating new contacts)

  const FormContent = useMemo(() => (
    <>
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className={`grid h-auto w-full mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="primary" className={isMobile ? 'text-sm h-10 px-2' : ''}>
            {isMobile ? 'Basic' : 'Primary Info'}
          </TabsTrigger>
          <TabsTrigger value="secondary" className={isMobile ? 'text-sm h-10 px-2' : ''}>
            {isMobile ? 'Extra' : 'Secondary Info'}
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </>
          )}
          {isMobile && (
            <>
              <TabsTrigger value="address" className="text-sm h-10 px-2">Address</TabsTrigger>
              <TabsTrigger value="additional" className="text-sm h-10 px-2">More</TabsTrigger>
            </>
          )}
        </TabsList>



        <TabsContent value="primary" className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              value={formData.middleName || ''}
              onChange={(e) => updateField('middleName', e.target.value)}
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary Email</Label>
              <Input
                id="primaryEmail"
                type="email"
                inputMode="email"
                value={formData.primaryEmail || ''}
                onChange={(e) => updateField('primaryEmail', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone</Label>
              <Input
                id="primaryPhone"
                type="tel"
                inputMode="tel"
                value={formData.primaryPhone || ''}
                onChange={(e) => updateField('primaryPhone', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => updateField('company', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle || ''}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department || ''}
              onChange={(e) => updateField('department', e.target.value)}
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>
        </TabsContent>

        <TabsContent value="secondary" className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="secondaryEmail">Secondary Email</Label>
              <Input
                id="secondaryEmail"
                type="email"
                inputMode="email"
                value={formData.secondaryEmail || ''}
                onChange={(e) => updateField('secondaryEmail', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Secondary Phone</Label>
              <Input
                id="secondaryPhone"
                type="tel"
                inputMode="tel"
                value={formData.secondaryPhone || ''}
                onChange={(e) => updateField('secondaryPhone', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="tertiaryEmail">Tertiary Email</Label>
              <Input
                id="tertiaryEmail"
                type="email"
                inputMode="email"
                value={formData.tertiaryEmail || ''}
                onChange={(e) => updateField('tertiaryEmail', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tertiaryPhone">Tertiary Phone</Label>
              <Input
                id="tertiaryPhone"
                type="tel"
                inputMode="tel"
                value={formData.tertiaryPhone || ''}
                onChange={(e) => updateField('tertiaryPhone', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Alternative Names</h4>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div className="space-y-2">
                <Label htmlFor="secondaryFirstName">Secondary First Name</Label>
                <Input
                  id="secondaryFirstName"
                  value={formData.secondaryFirstName || ''}
                  onChange={(e) => updateField('secondaryFirstName', e.target.value)}
                  className={isMobile ? 'h-12 text-base' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryLastName">Secondary Last Name</Label>
                <Input
                  id="secondaryLastName"
                  value={formData.secondaryLastName || ''}
                  onChange={(e) => updateField('secondaryLastName', e.target.value)}
                  className={isMobile ? 'h-12 text-base' : ''}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <h4 className="text-sm font-medium">Primary Address</h4>
          <div className="space-y-2">
            <Label htmlFor="primaryAddress">Address</Label>
            <Input
              id="primaryAddress"
              value={formData.primaryAddress || ''}
              onChange={(e) => updateField('primaryAddress', e.target.value)}
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="primaryCity">City</Label>
              <Input
                id="primaryCity"
                value={formData.primaryCity || ''}
                onChange={(e) => updateField('primaryCity', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryState">State</Label>
              <Input
                id="primaryState"
                value={formData.primaryState || ''}
                onChange={(e) => updateField('primaryState', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="primaryCountry">Country</Label>
              <Input
                id="primaryCountry"
                value={formData.primaryCountry || ''}
                onChange={(e) => updateField('primaryCountry', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryPostalCode">Postal Code</Label>
              <Input
                id="primaryPostalCode"
                value={formData.primaryPostalCode || ''}
                onChange={(e) => updateField('primaryPostalCode', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="primaryWebsite">Primary Website</Label>
              <Input
                id="primaryWebsite"
                type="url"
                inputMode="url"
                value={formData.primaryWebsite || ''}
                onChange={(e) => updateField('primaryWebsite', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                inputMode="url"
                value={formData.linkedinUrl || ''}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
                className={isMobile ? 'h-12 text-base' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={isMobile ? 6 : 4}
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Add any additional notes about this contact..."
              className={isMobile ? 'text-base min-h-[120px]' : ''}
            />
          </div>
        </TabsContent>
      </Tabs>
    </>
  ), [formData, isMobile, updateField]);

  const FooterButtons = () => (
    <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row justify-end'}`}>
      <Button 
        variant="outline" 
        onClick={onClose} 
        disabled={isLoading}
        className={isMobile ? 'h-12 text-base hover:shadow-md cursor-pointer' : 'hover:shadow-md cursor-pointer'}
      >
        Cancel
      </Button>
      <Button 
        onClick={handleSave} 
        disabled={isLoading}
        className={isMobile ? 'h-12 text-base hover:shadow-md cursor-pointer' : 'hover:shadow-md cursor-pointer'}
      >
        {isLoading ? 'Saving...' : contact ? 'Save Changes' : 'Create Contact'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader>
            <DrawerTitle>{contact ? 'Edit Contact' : 'Add Contact'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1">
            {FormContent}
          </div>
          <DrawerFooter>
            <FooterButtons />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        </DialogHeader>
        {FormContent}
        <DialogFooter>
          <FooterButtons />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
