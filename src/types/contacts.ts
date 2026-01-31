
export interface ExtractedContact {
  id: string;
  imageUrl: string;

  // Optional fields extracted from the business card
  name?: string;
  title?: string | string[];
  company?: string;
  email?: string | string[];
  phone?: string | string[];
  address?: string;
  website?: string | string[];
}

