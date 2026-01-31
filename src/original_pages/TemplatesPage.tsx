
import React from 'react';
import { TemplateManager } from '../components/templates/TemplateManager';
import Header from '../components/shared/Header';

const TemplatesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <TemplateManager />
      </div>
    </div>
  );
};

export default TemplatesPage;
