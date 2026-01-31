
import React from 'react';
import { ResponsiveContactTable } from './ResponsiveContactTable';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';

interface ContactManagementTableProps {
  onEditContact: (contact: BusinessCardContact) => void;
  onViewContact: (contact: BusinessCardContact) => void;
}

export const ContactManagementTable: React.FC<ContactManagementTableProps> = ({
  onEditContact,
  onViewContact,
}) => {
  return (
    <ResponsiveContactTable
      onEditContact={onEditContact}
      onViewContact={onViewContact}
    />
  );
};
