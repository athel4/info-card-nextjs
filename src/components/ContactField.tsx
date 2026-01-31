import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ContactFieldProps {
  icon: LucideIcon;
  label: string;
  value: string | string[] | undefined;
  iconColor: string;
}

export const ContactField: React.FC<ContactFieldProps> = ({ icon: Icon, label, value, iconColor }) => {
  if (!value) return null;

  const values = Array.isArray(value) ? value : [value];
  
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="space-y-1">
          {values.map((val, index) => (
            <div key={index} className="font-medium break-words">
              {val}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};