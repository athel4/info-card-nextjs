
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { useUserTemplates } from '@/hooks/useUserTemplates';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { TemplateForm } from './TemplateForm';
import { Template } from '@/domain/entities/Template';

export const TemplateManager: React.FC = () => {
  const { templates, userTemplates, isLoading, deleteTemplate } = useUserTemplates();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(templateId);
    }
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Template Manager</h2>
        {user && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className={`flex items-center gap-2 cursor-pointer hover:shadow-md ${isMobile ? 'w-full h-12' : ''}`}
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        )}
      </div>

      {(showCreateForm || editingTemplate) && (
        <TemplateForm
          template={editingTemplate}
          onClose={closeForm}
        />
      )}

      {user && userTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Templates</h3>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
            {userTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isOwner={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">
          User Defined Templates
        </h3>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
          {templates
            .filter(t => t.userId) // Only user-defined templates
            .map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isOwner={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isMobile={isMobile}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  isOwner: boolean;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  isMobile?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  isOwner, 
  onEdit, 
  onDelete,
  isMobile = false
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(template.promptText);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{template.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {template.generationCost} credits
            </Badge>
            {isOwner ? (
              <Badge variant="default">Your Template</Badge>
            ) : (
              <Badge variant="outline">Public</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium">Type:</span>
            <span className="text-sm text-gray-600 ml-2 capitalize">
              {template.templateType.replace('_', ' ')}
            </span>
          </div>
          
          {template.requiredPlaceholders.length > 0 && (
            <div>
              <span className="text-sm font-medium">Placeholders:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {template.requiredPlaceholders.map((placeholder) => (
                  <Badge key={placeholder} variant="outline" className="text-xs">
                    {`{${placeholder}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className={`${isMobile ? 'space-y-2' : 'flex justify-between items-center'} pt-2`}>
            <Button
              variant="outline"
              size={isMobile ? 'default' : 'sm'}
              onClick={copyToClipboard}
              className={`flex items-center gap-2 ${isMobile ? 'w-full h-10' : ''}`}
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
            
            {isOwner && (
              <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
                <Button
                  variant="outline"
                  size={isMobile ? 'default' : 'sm'}
                  onClick={() => onEdit(template)}
                  className={`flex items-center gap-2 ${isMobile ? 'flex-1 h-10' : ''}`}
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size={isMobile ? 'default' : 'sm'}
                  onClick={() => onDelete(template.id)}
                  className={`flex items-center gap-2 ${isMobile ? 'flex-1 h-10' : ''}`}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
