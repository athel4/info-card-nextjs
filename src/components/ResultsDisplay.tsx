'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase,
  Download,
  Eye,
  Grid3X3,
  List,
  X,
  RotateCcw
} from 'lucide-react';
import { ExtractedContact } from '@/types/contacts';
import { ContactField } from '@/components/ContactField';
import { AIGeneratedResult } from '@/utils/openaiService';
import * as XLSX from 'xlsx';

interface ResultsDisplayProps {
  extractedData: ExtractedContact[];
  generatedResults: AIGeneratedResult[];
  onStartOver: () => void;
  prompt: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  extractedData, 
  generatedResults, 
  onStartOver, 
  prompt 
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedCard, setSelectedCard] = useState<ExtractedContact | null>(null);

  const formatMultiValue = (value: string | string[] | undefined): string => {
    if (!value) return '';
    return Array.isArray(value) ? value.join('; ') : value;
  };

  const handleExportAll = () => {
    const exportData = extractedData.map((card, index) => ({
      cardNumber: index + 1,
      name: card.name || '',
      title: formatMultiValue(card.title) || '',
      company: card.company || '',
      email: formatMultiValue(card.email) || '',
      phone: formatMultiValue(card.phone) || '',
      address: card.address || '',
      website: formatMultiValue(card.website) || ''
    }));

    const worksheetData = [
      ['Card #', 'Name', 'Title', 'Company', 'Email', 'Phone', 'Address', 'Website'],
      ...exportData.map(card => [
        card.cardNumber,
        card.name,
        card.title,
        card.company,
        card.email,
        card.phone,
        card.address,
        card.website
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Business Cards');
    
    XLSX.writeFile(workbook, `business-cards-${Date.now()}.xlsx`);
  };

  // If only one card, display it prominently
  if (extractedData.length === 1) {
    const card = extractedData[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">
            Extracted Information
          </h3>
          <div className="md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportAll} className="hover:shadow-md cursor-pointer">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm" onClick={onStartOver} className="hover:shadow-md cursor-pointer">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Image */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Original Image</h4>
            <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
              <img
                src={card.imageUrl}
                alt="Business card"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Extracted Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Extracted Details</h4>
            <div className="space-y-4">
              {card.name && (
                <ContactField 
                  icon={User} 
                  label="Name" 
                  value={card.name} 
                  iconColor="text-blue-500" 
                />
              )}
              
              <ContactField 
                icon={Briefcase} 
                label="Title" 
                value={card.title} 
                iconColor="text-purple-500" 
              />
              
              {card.company && (
                <ContactField 
                  icon={Building} 
                  label="Company" 
                  value={card.company} 
                  iconColor="text-green-500" 
                />
              )}
              
              <ContactField 
                icon={Mail} 
                label="Email" 
                value={card.email} 
                iconColor="text-red-500" 
              />
              
              <ContactField 
                icon={Phone} 
                label="Phone" 
                value={card.phone} 
                iconColor="text-orange-500" 
              />
              
              <ContactField 
                icon={Globe} 
                label="Website" 
                value={card.website} 
                iconColor="text-cyan-500" 
              />
              
              {card.address && (
                <ContactField 
                  icon={MapPin} 
                  label="Address" 
                  value={card.address} 
                  iconColor="text-pink-500" 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple cards - show table and card views
  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Extracted Information
          </h3>
          <p className="text-gray-600 mt-1">
            {extractedData.length} business cards processed
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8 cursor-pointer hover:shadow-md"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 cursor-pointer hover:shadow-md"
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleExportAll} className="hover:shadow-md cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          
          <Button variant="outline" size="sm" onClick={onStartOver} className="hover:shadow-md cursor-pointer">
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {extractedData.map((card, index) => (
            <Card key={card.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img
                    src={card.imageUrl}
                    alt={`Business card ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{card.name || `Card ${index + 1}`}</span>
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {card.title && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-600">{formatMultiValue(card.title)}</span>
                  </div>
                )}
                {card.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">{card.company}</span>
                  </div>
                )}
                {card.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600 truncate">{formatMultiValue(card.email)}</span>
                  </div>
                )}
                {card.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-600">{formatMultiValue(card.phone)}</span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedCard(card)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">#</th>
                  <th className="text-left p-4 font-medium text-gray-700">Preview</th>
                  <th className="text-left p-4 font-medium text-gray-700">Name</th>
                  <th className="text-left p-4 font-medium text-gray-700">Title</th>
                  <th className="text-left p-4 font-medium text-gray-700">Company</th>
                  <th className="text-left p-4 font-medium text-gray-700">Email</th>
                  <th className="text-left p-4 font-medium text-gray-700">Phone</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {extractedData.map((card, index) => (
                  <tr key={card.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={card.imageUrl}
                          alt={`Card ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4 font-medium">{card.name || '-'}</td>
                    <td className="p-4 text-gray-600">{formatMultiValue(card.title) || '-'}</td>
                    <td className="p-4 text-gray-600">{card.company || '-'}</td>
                    <td className="p-4 text-gray-600">{formatMultiValue(card.email) || '-'}</td>
                    <td className="p-4 text-gray-600">{formatMultiValue(card.phone) || '-'}</td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCard(card)}
                        className="hover:shadow-md cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Business Card Details</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCard(null)}
                className="hover:shadow-md cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedCard && (
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              {/* Card Image */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Original Image</h4>
                <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
                  <img
                    src={selectedCard.imageUrl}
                    alt="Business card"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Extracted Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Extracted Details</h4>
                <div className="space-y-4">
                  {selectedCard.name && (
                    <ContactField 
                      icon={User} 
                      label="Name" 
                      value={selectedCard.name} 
                      iconColor="text-blue-500" 
                    />
                  )}
                  
                  <ContactField 
                    icon={Briefcase} 
                    label="Title" 
                    value={selectedCard.title} 
                    iconColor="text-purple-500" 
                  />
                  
                  {selectedCard.company && (
                    <ContactField 
                      icon={Building} 
                      label="Company" 
                      value={selectedCard.company} 
                      iconColor="text-green-500" 
                    />
                  )}
                  
                  <ContactField 
                    icon={Mail} 
                    label="Email" 
                    value={selectedCard.email} 
                    iconColor="text-red-500" 
                  />
                  
                  <ContactField 
                    icon={Phone} 
                    label="Phone" 
                    value={selectedCard.phone} 
                    iconColor="text-orange-500" 
                  />
                  
                  <ContactField 
                    icon={Globe} 
                    label="Website" 
                    value={selectedCard.website} 
                    iconColor="text-cyan-500" 
                  />
                  
                  {selectedCard.address && (
                    <ContactField 
                      icon={MapPin} 
                      label="Address" 
                      value={selectedCard.address} 
                      iconColor="text-pink-500" 
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResultsDisplay;
