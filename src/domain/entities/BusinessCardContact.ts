
export interface BusinessCardContact {
  id: string;
  userId?: string;
  sessionId?: string;
  anonymousSessionId?: string;
  
  // Primary name
  firstName?: string;
  middleName?: string;
  lastName?: string;
  
  // Secondary name
  secondaryFirstName?: string;
  secondaryMiddleName?: string;
  secondaryLastName?: string;
  
  // Tertiary name
  tertiaryFirstName?: string;
  tertiaryMiddleName?: string;
  tertiaryLastName?: string;
  
  // Email addresses
  primaryEmail?: string;
  secondaryEmail?: string;
  tertiaryEmail?: string;
  
  // Phone numbers
  primaryPhone?: string;
  primaryPhoneCountryCode?: string;
  secondaryPhone?: string;
  secondaryPhoneCountryCode?: string;
  tertiaryPhone?: string;
  tertiaryPhoneCountryCode?: string;
  
  // Company info
  company?: string;
  jobTitle?: string;
  department?: string;
  
  // Websites
  primaryWebsite?: string;
  secondaryWebsite?: string;
  tertiaryWebsite?: string;
  
  // Primary address
  primaryAddress?: string;
  primaryCity?: string;
  primaryState?: string;
  primaryCountry?: string;
  primaryPostalCode?: string;
  
  // Secondary address
  secondaryAddress?: string;
  secondaryCity?: string;
  secondaryState?: string;
  secondaryCountry?: string;
  secondaryPostalCode?: string;
  
  // Tertiary address
  tertiaryAddress?: string;
  tertiaryCity?: string;
  tertiaryState?: string;
  tertiaryCountry?: string;
  tertiaryPostalCode?: string;
  
  // Additional info
  linkedinUrl?: string;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
