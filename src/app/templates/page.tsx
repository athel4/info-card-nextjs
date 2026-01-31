'use client';

import React from 'react';
import { TemplateManager } from '@/presentation/components/templates/TemplateManager';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TemplateManager />
      </div>
    </div>
  );
}
