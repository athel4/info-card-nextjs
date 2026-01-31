import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const FAQ = () => {
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

  return (
    <>
      <SEOHead 
        title="FAQ - AI Business Card Scanner"
        description="Frequently asked questions about our AI business card scanner. Learn about accuracy, supported formats, security, pricing, and how to extract contacts from business cards."
        keywords="business card scanner FAQ, AI OCR questions, contact extraction help, business card app support"
        breadcrumbs={[
          {name: "Home", url: "/"},
          {name: "FAQ", url: "/faq"}
        ]}
      />
      <div className="min-h-screen bg-gray-50 py-8">
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
                    <small className="block font-normal text-black">
                      <p>Vebmy helps teams grow with clarity through practical products and training.</p>
                    </small>
                    <small className="block text-gray-600  mb-4 " style={{fontSize:'0.8rem'}}>
                     (Company Registration: 003102840-K)
                    </small>
                  </h3>                  
                </div>
                <p className="text-center pb-5" style={{marginTop:'0rem'}}>
                  **Spark—our AI business-card scanner—**<br/>Captures contacts and keeps the promise: warm follow-ups, clean records, zero extra admin.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Website</h4>
                    <a href="https://vebmy.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      vebmy.com
                    </a>
                  </div>                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
                    <a href="tel:+601125894028" className="text-blue-600 hover:text-blue-800 underline">
                      +60 11 2589 4028
                    </a>
                  </div>                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                    <a href="mailto:info@vebmy.com" className="text-blue-600 hover:text-blue-800 underline">
                      info@vebmy.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
                <p className="text-gray-600 mb-4">
                  Can't find what you're looking for? Get in touch with our support team.
                </p>
                <a href="mailto:info@vebmy.com" className="text-blue-600 hover:text-blue-800 underline">
                  Contact Support
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;