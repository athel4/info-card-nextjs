
import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Download, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { ContactFilters } from '../../application/use-cases/contacts/GetAllUserContactsUseCase';
import { createContactTableColumns, ContactTablePersonafyModal } from './ContactTableColumns';
import { MobileContactTable } from './MobileContactTable';
import { useApplicationServices } from '../../presentation/contexts/ApplicationServiceContext';
import { useAuth } from '../../presentation/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContactTableProps {
  onEditContact: (contact: BusinessCardContact) => void;
  onViewContact: (contact: BusinessCardContact) => void;
}

const ResponsiveContactTable: React.FC<ResponsiveContactTableProps> = ({
  onEditContact,
  onViewContact,
}) => {
  const { user } = useAuth();
  const { contactService } = useApplicationServices();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: isMobile ? 10 : 25 });
  
  const [filters, setFilters] = useState<ContactFilters>({
    search: '',
    dateRange: 'all',
    completeness: 'all'
  });

  const { data: contactsData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-contacts', user?.id, pagination.pageIndex + 1, pagination.pageSize, filters],
    queryFn: async () => {
      if (!user?.id) return { contacts: [], totalCount: 0, hasMore: false };
      try {
        const result = await contactService.getAllUserContacts(user.id, pagination.pageSize, pagination.pageIndex, filters);
        return { contacts: result.contacts || [], totalCount: result.totalCount || 0, hasMore: result.hasMore || false };
      } catch (error) {
        console.error('Error fetching contacts:', error);
        return { contacts: [], totalCount: 0, hasMore: false };
      }
    },
    enabled: !!user?.id,
  });

  const handleDeleteContact = async (contact: BusinessCardContact) => {
    try {
      await contactService.deleteContact(contact.id);
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    const selectedContacts = isMobile 
      ? contactsData?.contacts.filter(c => Object.keys(rowSelection).includes(c.id)) || []
      : table.getFilteredSelectedRowModel().rows.map(row => row.original);
    
    try {
      await Promise.all(selectedContacts.map(contact => 
        contactService.deleteContact(contact.id)
      ));
      toast({
        title: "Contacts deleted",
        description: `${selectedContacts.length} contacts have been deleted.`,
      });
      setRowSelection({});
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportContacts = () => {
    const selectedContacts = isMobile
      ? contactsData?.contacts.filter(c => Object.keys(rowSelection).includes(c.id)) || []
      : table.getFilteredSelectedRowModel().rows.map(row => row.original);
    const contactsToExport = selectedContacts.length > 0 ? selectedContacts : contactsData?.contacts || [];
    
    const worksheetData = [
      ['Name', 'Company', 'Job Title', 'Email', 'Phone', 'Address', 'Notes'],
      ...contactsToExport.map(contact => [
        [contact.firstName, contact.lastName].filter(Boolean).join(' '),
        contact.company || '',
        contact.jobTitle || '',
        contact.primaryEmail || '',
        contact.primaryPhone || '',
        [contact.primaryAddress, contact.primaryCity, contact.primaryState].filter(Boolean).join(', '),
        contact.notes || ''
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
    
    XLSX.writeFile(workbook, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export completed",
      description: `${contactsToExport.length} contacts exported to Excel.`,
    });
  };

  const columns = useMemo(
    () => createContactTableColumns(onEditContact, handleDeleteContact, onViewContact, refetch),
    [onEditContact, onViewContact, refetch]
  );

  const tableData = contactsData?.contacts || [];
  
  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    pageCount: Math.ceil((contactsData?.totalCount || 0) / pagination.pageSize),
    manualPagination: true,
  });

  const selectedCount = isMobile 
    ? Object.keys(rowSelection).length
    : table.getFilteredSelectedRowModel().rows.length;

  const handleMobileSelectContact = (contactId: string) => {
    setRowSelection(prev => ({
      ...prev,
      [contactId]: !prev[contactId]
    }));
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading contacts. Please try again.</p>
        <Button onClick={() => refetch()} className="mt-4 hover:shadow-md cursor-pointer">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts... (use commas to search multiple: john, smith, acme)"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
            {filters.search && filters.search.includes(',') && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="text-xs">
                  {filters.search.split(',').filter(term => term.trim()).length} terms
                </Badge>
              </div>
            )}
          </div>
          
          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              dateRange: value as 'week' | 'month' | 'quarter' | 'all'
            }))}
          >
            <SelectTrigger className={isMobile ? "w-full" : "w-40"}>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleExportContacts} className="shrink-0 hover:shadow-md cursor-pointer" title="Export Contacts">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {selectedCount > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <Badge variant="secondary">{selectedCount} selected</Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700 hover:shadow-md cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table or Mobile Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: isMobile ? 3 : 5 }).map((_, index) => (
            <Skeleton key={index} className={isMobile ? "h-32 w-full" : "h-16 w-full"} />
          ))}
        </div>
      ) : isMobile ? (
        <MobileContactTable
          contacts={contactsData?.contacts || []}
          onEditContact={onEditContact}
          onViewContact={onViewContact}
          onDeleteContact={handleDeleteContact}
          selectedContacts={Object.keys(rowSelection)}
          onSelectContact={handleMobileSelectContact}
          onRefresh={refetch}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : typeof header.column.columnDef.header === 'function'
                        ? header.column.columnDef.header(header.getContext())
                        : table.getColumn(header.id)?.getCanSort()
                        ? (
                          <Button
                            variant="ghost"
                            onClick={() => header.column.toggleSorting()}
                            className="h-auto p-0 font-medium hover:shadow-md cursor-pointer"
                          >
                            {header.column.columnDef.header as string}
                            {header.column.getIsSorted() === 'asc' && ' ↑'}
                            {header.column.getIsSorted() === 'desc' && ' ↓'}
                          </Button>
                        )
                        : (header.column.columnDef.header as string)}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.column.columnDef.cell 
                          ? (cell.column.columnDef.cell as any)(cell.getContext())
                          : cell.getValue() as string}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, contactsData?.totalCount || 0)} of{' '}
          {contactsData?.totalCount || 0} contacts
        </div>
        
        <div className="flex items-center space-x-2">
          <Select 
            value={pagination.pageSize.toString()} 
            onValueChange={(value) => setPagination(prev => ({ ...prev, pageSize: parseInt(value), pageIndex: 0 }))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              {!isMobile && <SelectItem value="100">100</SelectItem>}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="hover:shadow-md cursor-pointer"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="hover:shadow-md cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>
      
      <ContactTablePersonafyModal />
    </div>
  );
};

export { ResponsiveContactTable };
