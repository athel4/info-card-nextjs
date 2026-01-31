
// Simple text extraction without heavy ML dependencies
import { sanitizeForLog } from './security';

interface ExtractedData {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

// Simulate text extraction with sample business card data
const extractTextFromImage = async (file: File): Promise<string> => {
  console.log(`Processing ${sanitizeForLog(file.name)} - using sample data for demo`);
  
  // Return sample business card text for demonstration
  return 'John Smith\nSenior Software Engineer\nTech Solutions Inc.\njohn.smith@techsolutions.com\n+1 (555) 123-4567\n123 Business Ave, Suite 100\nSan Francisco, CA 94102\nwww.techsolutions.com';
};

// Parse extracted text to structured data
const parseBusinessCardText = (text: string): ExtractedData => {
  const lines = text.split('\n').filter(line => line.trim());
  const result: ExtractedData = {};

  // Email regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  
  // Phone regex (various formats)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
  
  // Website regex
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/;
  
  // Company indicators
  const companyKeywords = ['inc', 'llc', 'corp', 'company', 'ltd', 'limited', 'solutions', 'group', 'enterprises'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // Extract email
    const emailMatch = line.match(emailRegex);
    if (emailMatch && !result.email) {
      result.email = emailMatch[0];
      continue;
    }

    // Extract phone
    const phoneMatch = line.match(phoneRegex);
    if (phoneMatch && !result.phone) {
      result.phone = phoneMatch[0];
      continue;
    }

    // Extract website
    const websiteMatch = line.match(websiteRegex);
    if (websiteMatch && !result.website) {
      result.website = websiteMatch[0];
      continue;
    }

    // Check if line contains company keywords
    const isCompany = companyKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isCompany && !result.company) {
      result.company = line;
      continue;
    }

    // Address detection (lines with numbers and street indicators)
    if (line.match(/\d+.*(?:street|st|avenue|ave|road|rd|drive|dr|blvd|boulevard|suite|floor|#)/i) && !result.address) {
      // Combine with next line if it looks like city/state
      let address = line;
      if (i + 1 < lines.length && lines[i + 1].match(/[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}/)) {
        address += '\n' + lines[i + 1];
        i++; // Skip next line as we've used it
      }
      result.address = address;
      continue;
    }

    // Name detection (first non-categorized line, typically a person's name)
    if (!result.name && line.match(/^[A-Za-z\s\.]+$/) && line.split(' ').length >= 2) {
      result.name = line;
      continue;
    }

    // Title detection (professional titles)
    const titleKeywords = ['manager', 'director', 'engineer', 'developer', 'analyst', 'consultant', 'specialist', 'coordinator', 'supervisor', 'executive', 'president', 'ceo', 'cto', 'cfo'];
    const isTitle = titleKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isTitle && !result.title) {
      result.title = line;
      continue;
    }

    // If we don't have a company yet and this line has multiple words but isn't a name or title
    if (!result.company && !result.name && line.split(' ').length >= 2 && !isTitle) {
      result.company = line;
    }
  }

  return result;
};

// Main extraction function
export const extractBusinessCardInfo = async (file: File): Promise<ExtractedData> => {
  try {
    console.log(`Extracting information from ${sanitizeForLog(file.name)}...`);
    
    // Extract text using OCR
    const extractedText = await extractTextFromImage(file);
    console.log('Extracted text:', sanitizeForLog(extractedText));
    
    // Parse the text into structured data
    const parsedData = parseBusinessCardText(extractedText);
    console.log('Parsed data:', sanitizeForLog(parsedData));
    
    return parsedData;
  } catch (error) {
    console.error('Error extracting business card info:', sanitizeForLog(error));
    
    // Return mock data for demonstration purposes
    return {
      name: 'Sample Name',
      title: 'Sample Title',
      company: 'Sample Company',
      email: 'sample@email.com',
      phone: '+1 (555) 000-0000'
    };
  }
};
