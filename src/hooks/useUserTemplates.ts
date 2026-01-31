
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useApplicationServices } from '../presentation/contexts/ApplicationServiceContext';
import { Template } from '../domain/entities/Template';
import { useToast } from './use-toast';

export const useUserTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { templateService } = useApplicationServices();
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      if (!user) {
        // For anonymous users, only get public templates
        const publicTemplates = await templateService.getPublicTemplates();
        setTemplates(publicTemplates);
        setUserTemplates([]);
      } else {
        // For authenticated users, get all templates (public + user's own)
        const [allTemplates, ownTemplates] = await Promise.all([
          templateService.getAllAvailableTemplates(user.id),
          templateService.getUserTemplates(user.id)
        ]);
        setTemplates(allTemplates);
        setUserTemplates(ownTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const createTemplate = async (templateData: {
    name: string;
    title: string;
    description?: string;
    promptText: string;
    templateType: string;
    patternText?: string;
    flexibilityLevel: 'strict' | 'medium' | 'flexible';
    requiredPlaceholders: string[];
    generationCost?: number;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create custom templates",
        variant: "destructive"
      });
      return;
    }

    try {
      await templateService.createTemplate(user.id, templateData);
      toast({
        title: "Success",
        description: "Template created successfully"
      });
      fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      });
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<Template>) => {
    try {
      await templateService.updateTemplate(templateId, updates);
      toast({
        title: "Success",
        description: "Template updated successfully"
      });
      fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await templateService.deleteTemplate(templateId);
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates, // All available templates (public + user's own)
    userTemplates, // Only user's own templates
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplates: fetchTemplates
  };
};
