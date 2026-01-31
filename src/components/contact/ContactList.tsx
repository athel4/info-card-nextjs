
import React from 'react';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { ContactCard } from './ContactCard';

interface ContactListProps {
  contacts: BusinessCardContact[];
  onEditContact?: (contact: BusinessCardContact) => void;
}

export const ContactList: React.FC<ContactListProps> = ({ contacts, onEditContact }) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">No contacts found</div>
        <div className="text-sm text-gray-400">
          Process some business cards to see contacts here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Extracted Contacts ({contacts.length})
        </h3>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={onEditContact}
          />
        ))}
      </div>
    </div>
  );
};
