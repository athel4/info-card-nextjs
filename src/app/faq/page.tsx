import React from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "FAQ - Info Card Sorter",
  description: "Frequently asked questions about our AI business card scanner.",
};

export default function FAQPage() {
  const faqs = [
    {
      question: "How accurate is the AI extraction?",
      answer: "Our AI achieves 99%+ accuracy in extracting contact information from business cards, including names, emails, phones, and addresses. Actual results may vary depending on the design complexity and image quality of the business card."
    },
    {
      question: "What file formats are supported?",
      answer: "We support JPG & PNG files. Simply upload your business card image and our AI will extract all the information."
    },
    {
      question: "Is my data secure?",
      answer: "We handle your data responsibly. Uploaded cards may be securely stored and reviewed by our internal team to improve AI accuracy and service quality. Please avoid uploading sensitive information such as government IDs or financial details."
    },
    {
      question: "Can I try it for free?",
      answer: "Yes! You get 10 free credits to scan business cards. No credit card required to get started."
    },
    {
      question: "How does the AI message generation work?",
      answer: "Our AI analyzes the extracted contact information and generates personalized WhatsApp messages, and/or emails based on your requirements."
    },
    {
      question: "Can I export the extracted contacts?",
      answer: "Yes, you can export contacts to excel format and even integrate with popular CRM systems with paid package tiers."
    },
    {
      question: "What languages are supported?",
      answer: "Our AI can extract information from business cards in multiple languages including English, Chinese, Malay, and other major languages."
    },
    {
      question: "How fast is the processing?",
      answer: "Most business cards are processed within 5–10 seconds under normal conditions. Bulk processing is available for multiple cards at once. Actual speed may vary depending on factors such as internet connectivity, server load, image quality, and the number of cards processed simultaneously."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 safe-area-pb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="h-12 w-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our AI business card scanner
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* About Us Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 text-center">
                About Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Vebmy Tech & Solutions                    
                  <small className="block font-normal text-black mt-1">
                    <p>Vebmy helps teams grow with clarity through practical products and training.</p>
                  </small>
                  <small className="block text-gray-600 mt-2" style={{fontSize:'0.8rem'}}>
                   (Company Registration: 003102840-K)
                  </small>
                </h3>                  
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
