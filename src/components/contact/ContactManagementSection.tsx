
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Building, Calendar, Plus, Upload, Download, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import * as XLSX from 'xlsx';
import { ContactManagementTable } from './ContactManagementTable';
import { ContactEditModal } from './ContactEditModal';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApplicationServices } from '../../presentation/contexts/ApplicationServiceContext';
import { useAuth } from '../../presentation/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const ContactManagementSection: React.FC = () => {
  const { user } = useAuth();
  const { contactService } = useApplicationServices();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [editingContact, setEditingContact] = useState<BusinessCardContact | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch contact stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['contact-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Fetch all contacts to calculate stats
      let result;
      try {
        result = await contactService.getAllUserContacts(user.id, 25, 0, {});
      } catch (error) {
        console.log('Stats fetch error:', error);
        // Fallback to minimal fetch if range error
        result = { contacts: [], totalCount: 0, hasMore: false };
      }
      const contacts = result.contacts;
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentContacts = contacts.filter(c => new Date(c.createdAt) >= weekAgo);
      const companies = new Set(contacts.filter(c => c.company).map(c => c.company!.toLowerCase().trim()));
      // const avgCompleteness = contacts.length > 0 
      //   ? Math.round(contacts.reduce((sum, c) => {
      //       // Simple completeness calculation
      //       const fields = [c.firstName, c.lastName, c.primaryEmail, c.primaryPhone, c.company];
      //       const filledFields = fields.filter(f => f && f.trim() !== '').length;
      //       return sum + (filledFields / fields.length) * 100;
      //     }, 0) / contacts.length)
      //   : 0;
      return {
        totalContacts: contacts.length,
        recentContacts: recentContacts.length,
        totalCompanies: companies.size,
        //avgCompleteness
      };
    },
    enabled: !!user?.id,
  });

  const handleEditContact = (contact: BusinessCardContact) => {
    setEditingContact(contact);
    setIsEditModalOpen(true);
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setIsEditModalOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (fileExtension === 'csv') {
      // Handle CSV files
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        await processCSVContent(text);
      };
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as ArrayBuffer;
        await processExcelContent(data);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({
        title: "Unsupported file format",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
    }
  };

  const processCSVContent = async (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const contacts = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const contact: any = {};

        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, '') || '';
          if (!value) return;

          // Map CSV headers to contact fields
          switch (header) {
            case 'firstname':
              contact.firstName = value;
              break;
            case 'middlename':
              contact.middleName = value;
              break;
            case 'lastname':
              contact.lastName = value;
              break;
            case 'primaryemail':
              contact.primaryEmail = value;
              break;
            case 'primaryphone':
              contact.primaryPhone = value;
              break;
            case 'company':
              contact.company = value;
              break;
            case 'jobtitle':
              contact.jobTitle = value;
              break;
            case 'department':
              contact.department = value;
              break;
            case 'primarywebsite':
              contact.primaryWebsite = value;
              break;
            case 'linkedinurl':
              contact.linkedinUrl = value;
              break;
            case 'primaryaddress':
              contact.primaryAddress = value;
              break;
            case 'primarycity':
              contact.primaryCity = value;
              break;
            case 'primarystate':
              contact.primaryState = value;
              break;
            case 'primarycountry':
              contact.primaryCountry = value;
              break;
            case 'primarypostalcode':
              contact.primaryPostalCode = value;
              break;
            case 'notes':
              contact.notes = value;
              break;
          }
        });

        if (contact.firstName || contact.lastName || contact.primaryEmail) {
          contacts.push(contact);
        }
      }

      // Bulk create contacts
      for (const contact of contacts) {
        await contactService.createContact(user!.id, contact);
      }

      toast({
        title: "Contacts imported",
        description: `Successfully imported ${contacts.length} contacts.`,
      });
      
      // Refresh the contact table and stats
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['user-contacts'] });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import contacts. Please check file format.",
        variant: "destructive",
      });
    }
  };

  const processExcelContent = async (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      if (jsonData.length < 2) return;

      const headers = jsonData[0].map(h => h?.toString().trim().toLowerCase() || '');
      const contacts = [];

      for (let i = 1; i < jsonData.length; i++) {
        const values = jsonData[i];
        const contact: any = {};

        headers.forEach((header, index) => {
          const value = values[index]?.toString().trim() || '';
          if (!value) return;

          // Map Excel headers to contact fields (same mapping as CSV)
          switch (header) {
            case 'firstname':
              contact.firstName = value;
              break;
            case 'middlename':
              contact.middleName = value;
              break;
            case 'lastname':
              contact.lastName = value;
              break;
            case 'primaryemail':
              contact.primaryEmail = value;
              break;
            case 'primaryphone':
              contact.primaryPhone = value;
              break;
            case 'company':
              contact.company = value;
              break;
            case 'jobtitle':
              contact.jobTitle = value;
              break;
            case 'department':
              contact.department = value;
              break;
            case 'primarywebsite':
              contact.primaryWebsite = value;
              break;
            case 'linkedinurl':
              contact.linkedinUrl = value;
              break;
            case 'primaryaddress':
              contact.primaryAddress = value;
              break;
            case 'primarycity':
              contact.primaryCity = value;
              break;
            case 'primarystate':
              contact.primaryState = value;
              break;
            case 'primarycountry':
              contact.primaryCountry = value;
              break;
            case 'primarypostalcode':
              contact.primaryPostalCode = value;
              break;
            case 'notes':
              contact.notes = value;
              break;
          }
        });

        if (contact.firstName || contact.lastName || contact.primaryEmail) {
          contacts.push(contact);
        }
      }

      // Bulk create contacts
      for (const contact of contacts) {
        await contactService.createContact(user!.id, contact);
      }

      toast({
        title: "Contacts imported",
        description: `Successfully imported ${contacts.length} contacts from Excel file.`,
      });
      
      // Refresh the contact table and stats
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['user-contacts'] });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import contacts from Excel file. Please check file format.",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const data = [
      ['firstName', 'middleName', 'lastName', 'primaryEmail', 'primaryPhone', 'company', 'jobTitle', 'department', 'primaryWebsite', 'linkedinUrl', 'primaryAddress', 'primaryCity', 'primaryState', 'primaryCountry', 'primaryPostalCode', 'notes'],
      ['John', 'M', 'Doe', 'john@example.com', '+1234567890', 'Example Corp', 'Manager', 'Sales', 'https://example.com', 'https://linkedin.com/in/johndoe', '123 Main St', 'New York', 'NY', 'USA', '10001', 'Sample contact']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    XLSX.writeFile(wb, 'contact_template.xlsx');
  };

  const handleViewContact = (contact: BusinessCardContact) => {
    // For now, just edit - could be expanded to a read-only view
    handleEditContact(contact);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingContact(null);
  };

  const handleSaveContact = () => {
    // Refetch will happen automatically through react-query
  };
  
  return (
    <div className="space-y-6">
      {/* Contact Stats Overview */}
      {statsData === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.totalContacts || 0}</div>
            <p className="text-xs text-muted-foreground">
              All extracted contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.recentContacts || 0}</div>
            <p className="text-xs text-muted-foreground">
              New contacts added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique organizations
            </p>
          </CardContent>
        </Card>
        </div>
      )}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.avgCompleteness || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Contact information filled
            </p>
          </CardContent>
        </Card> */}
 
      {/* Contact Management Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription className="hidden sm:block">
                Manage all your extracted business card contacts in one place
              </CardDescription>
            </div>
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="hover:shadow-md cursor-pointer">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleAddContact} className="cursor-pointer hover:shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => document.getElementById('file-upload')?.click()} className="cursor-pointer hover:shadow-sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadTemplate} className="cursor-pointer hover:shadow-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleAddContact} size="sm" className="hover:shadow-md cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
                <Button size="sm" variant="outline" onClick={() => document.getElementById('file-upload')?.click()} className="hover:shadow-md cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Files
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadTemplate} className="hover:shadow-md cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>
            )}
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ContactManagementTable
            onEditContact={handleEditContact}
            onViewContact={handleViewContact}
          />
        </CardContent>
      </Card>

      {/* Edit Contact Modal */}
      <ContactEditModal
        contact={editingContact}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveContact}
      />
    </div>
  );
};
