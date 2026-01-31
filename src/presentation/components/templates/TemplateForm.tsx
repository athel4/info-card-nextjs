
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useUserTemplates } from '@/hooks/useUserTemplates';
import { useIsMobile } from '@/hooks/use-mobile';
import { Template } from '@/domain/entities/Template';
import { extractPlaceholders } from '@/utils/templateMatcher';

interface TemplateFormProps {
  template?: Template | null;
  onClose: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({ template, onClose }) => {
  const { createTemplate, updateTemplate } = useUserTemplates();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    promptText: '',
    templateType: 'custom',
    patternText: '',
    flexibilityLevel: 'medium' as 'strict' | 'medium' | 'flexible',
    requiredPlaceholders: [] as string[],
    generationCost: 2
  });
  const [customPlaceholder, setCustomPlaceholder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        title: template.title,
        description: template.description || '',
        promptText: template.promptText,
        templateType: template.templateType,
        patternText: template.patternText || '',
        flexibilityLevel: template.flexibilityLevel,
        requiredPlaceholders: template.requiredPlaceholders,
        generationCost: template.generationCost
      });
    }
  }, [template]);

  // Auto-detect placeholders from pattern text
  useEffect(() => {
    if (formData.patternText) {
      const detected = extractPlaceholders(formData.patternText);
      setFormData(prev => ({
        ...prev,
        requiredPlaceholders: Array.from(new Set([...prev.requiredPlaceholders, ...detected]))
      }));
    }
  }, [formData.patternText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (template) {
        await updateTemplate(template.id, formData);
      } else {
        await createTemplate(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPlaceholder = () => {
    if (customPlaceholder && !formData.requiredPlaceholders.includes(customPlaceholder)) {
      setFormData(prev => ({
        ...prev,
        requiredPlaceholders: [...prev.requiredPlaceholders, customPlaceholder]
      }));
      setCustomPlaceholder('');
    }
  };

  const removePlaceholder = (placeholder: string) => {
    setFormData(prev => ({
      ...prev,
      requiredPlaceholders: prev.requiredPlaceholders.filter(p => p !== placeholder)
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {template ? 'Edit Template' : 'Create New Template'}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Template internal name"
                className={isMobile ? 'h-12 text-base' : ''}
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Display Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Template display title"
                className={isMobile ? 'h-12 text-base' : ''}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this template does"
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="templateType">Type</Label>
              <Select
                value={formData.templateType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, templateType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="whatsapp_networking">WhatsApp Networking</SelectItem>
                  <SelectItem value="email_followup">Email Follow-up</SelectItem>
                  <SelectItem value="linkedin_connect">LinkedIn Connect</SelectItem>
                  <SelectItem value="crm_import">CRM Import</SelectItem>
                  <SelectItem value="mixed_outreach">Mixed Outreach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="flexibilityLevel">Flexibility</Label>
              <Select
                value={formData.flexibilityLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, flexibilityLevel: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="promptText">Prompt Text</Label>
            <Textarea
              id="promptText"
              value={formData.promptText}
              onChange={(e) => setFormData(prev => ({ ...prev, promptText: e.target.value }))}
              placeholder="The AI prompt that will be used to generate content"
              rows={isMobile ? 6 : 4}
              className={isMobile ? 'text-base min-h-[120px]' : ''}
              required
            />
          </div>

          <div>
            <Label htmlFor="patternText">Pattern Text (Optional)</Label>
            <Textarea
              id="patternText"
              value={formData.patternText}
              onChange={(e) => setFormData(prev => ({ ...prev, patternText: e.target.value }))}
              placeholder="Pattern with placeholders like: Hi {name}, I met you at {event}..."
              rows={isMobile ? 4 : 3}
              className={isMobile ? 'text-base min-h-[100px]' : ''}
            />
          </div>

          <div>
            <Label>Placeholders</Label>
            <div className={`${isMobile ? 'space-y-2' : 'flex gap-2'} mb-2`}>
              <Input
                value={customPlaceholder}
                onChange={(e) => setCustomPlaceholder(e.target.value)}
                placeholder="Add placeholder (e.g., name, event, company)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlaceholder())}
                className={isMobile ? 'h-12 text-base' : ''}
              />
              <Button 
                type="button" 
                onClick={addPlaceholder} 
                size={isMobile ? 'default' : 'sm'}
                className={isMobile ? 'w-full h-12' : ''}
              >
                <Plus className="h-4 w-4" />
                {isMobile && <span className="ml-2">Add</span>}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requiredPlaceholders.map((placeholder) => (
                <Badge key={placeholder} variant="secondary" className="flex items-center gap-1">
                  {`{${placeholder}}`}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removePlaceholder(placeholder)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="generationCost">Generation Cost (Credits)</Label>
            <Input
              id="generationCost"
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              value={formData.generationCost}
              onChange={(e) => setFormData(prev => ({ ...prev, generationCost: parseInt(e.target.value) || 2 }))}
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex justify-end gap-2'} pt-4`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className={isMobile ? 'h-12 text-base' : ''}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={isMobile ? 'h-12 text-base' : ''}
            >
              {isSubmitting ? 'Saving...' : (template ? 'Update' : 'Create')} Template
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
