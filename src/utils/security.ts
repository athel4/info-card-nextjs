// Security utilities for sanitization
export const sanitizeForLog = (input: any): string => {
  if (typeof input !== 'string') {
    input = String(input);
  }
  return input.replace(/[\r\n\t]/g, ' ').substring(0, 200);
};

export const sanitizeForHTML = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const safeStringify = (obj: any): string => {
  try {
    console.log('ath apalah 1')
    return JSON.stringify(obj, null, 2);
  } catch {
    console.log('ath apalah 2')
    return '[Object]';
  }
};