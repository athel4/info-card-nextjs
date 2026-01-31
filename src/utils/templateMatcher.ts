
export interface TemplatePattern {
  id: string;
  name: string;
  pattern_text: string | null;
  flexibility_level: 'strict' | 'medium' | 'flexible';
  required_placeholders: string[];
}

export interface MatchResult {
  isMatch: boolean;
  confidence: number;
  extractedValues: Record<string, string>;
  reason?: string;
}

// Extract placeholders from pattern text
export const extractPlaceholders = (pattern: string): string[] => {
  const matches = pattern.match(/\{([^}]+)\}/g);
  return matches ? matches.map(match => match.slice(1, -1)) : [];
};

// Calculate similarity between two strings (0-1 scale)
const calculateSimilarity = (str1: string, str2: string): number => {
  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  const normalized1 = normalize(str1);
  const normalized2 = normalize(str2);
  
  if (normalized1 === normalized2) return 1;
  
  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return totalWords > 0 ? commonWords.length / totalWords : 0;
};

// Check if user text matches template pattern
export const matchTemplatePattern = (
  userText: string, 
  template: TemplatePattern
): MatchResult => {
  // If no pattern defined, only match exact text
  if (!template.pattern_text) {
    return {
      isMatch: userText.trim() === template.pattern_text?.trim(),
      confidence: userText.trim() === template.pattern_text?.trim() ? 1 : 0,
      extractedValues: {}
    };
  }

  const pattern = template.pattern_text;
  const placeholders = extractPlaceholders(pattern);
  
  // Create regex pattern from template
  let regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special chars
  const extractedValues: Record<string, string> = {};
  
  // Replace placeholders with capture groups
  placeholders.forEach(placeholder => {
    regexPattern = regexPattern.replace(
      `\\{${placeholder}\\}`, 
      `([^,\\.!\\?]+?)` // Capture until punctuation
    );
  });
  
  // Make the pattern more flexible based on flexibility level
  switch (template.flexibility_level) {
    case 'strict':
      // Exact match required
      break;
    case 'medium':
      // Allow minor variations and extra words
      regexPattern = regexPattern.replace(/\s+/g, '\\s*');
      regexPattern = `\\s*${regexPattern}\\s*`;
      break;
    case 'flexible':
      // Very loose matching - just check for key elements
      const keyWords = pattern.replace(/\{[^}]+\}/g, '').split(/\s+/).filter(word => word.length > 2);
      const hasKeyWords = keyWords.every(word => 
        userText.toLowerCase().includes(word.toLowerCase())
      );
      if (hasKeyWords && placeholders.length > 0) {
        // Try to extract any names/values mentioned
        const nameMatch = userText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/);
        if (nameMatch && placeholders.includes('name')) {
          extractedValues.name = nameMatch[0];
        }
        return {
          isMatch: true,
          confidence: 0.7,
          extractedValues,
          reason: 'Flexible matching - contains key elements'
        };
      }
      return { isMatch: false, confidence: 0, extractedValues: {} };
  }
  
  // Try to match the pattern
  const regex = new RegExp(regexPattern, 'i');
  const match = userText.match(regex);
  
  if (match) {
    // Extract placeholder values
    placeholders.forEach((placeholder, index) => {
      if (match[index + 1]) {
        extractedValues[placeholder] = match[index + 1].trim();
      }
    });
    
    // Check if required placeholders are present
    const hasRequiredPlaceholders = template.required_placeholders.every(
      req => extractedValues[req] && extractedValues[req].length > 0
    );
    
    if (!hasRequiredPlaceholders) {
      return {
        isMatch: false,
        confidence: 0.3,
        extractedValues,
        reason: 'Missing required placeholders'
      };
    }
    
    return {
      isMatch: true,
      confidence: 0.9,
      extractedValues,
      reason: 'Pattern matched successfully'
    };
  }
  
  // Fallback: check similarity
  const similarity = calculateSimilarity(userText, pattern);
  const threshold = template.flexibility_level === 'strict' ? 0.9 : 
                   template.flexibility_level === 'medium' ? 0.6 : 0.4;
  
  return {
    isMatch: similarity >= threshold,
    confidence: similarity,
    extractedValues,
    reason: similarity >= threshold ? 'Similar structure detected' : 'Pattern does not match'
  };
};

// Check if user text is close enough to template to use direct generation
export const shouldUseTemplateGeneration = (
  userText: string,
  template: TemplatePattern
): { useTemplate: boolean; matchResult: MatchResult } => {
  const matchResult = matchTemplatePattern(userText, template);
  
  // Use template generation if confidence is above threshold
  const useTemplate = matchResult.confidence >= 0.5;
  
  return { useTemplate, matchResult };
};
