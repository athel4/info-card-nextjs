
export interface Template {
  id: string;
  userId?: string; // null for system templates, user ID for user templates
  name: string;
  title: string;
  description?: string;
  promptText: string;
  templateType: string;
  patternText?: string;
  flexibilityLevel: 'strict' | 'medium' | 'flexible';
  requiredPlaceholders: string[];
  generationCost: number;
  isActive: boolean;
  sortOrder: number;
  showInAnalyzerPage:boolean;
  createdAt: Date;
  updatedAt: Date;
}
