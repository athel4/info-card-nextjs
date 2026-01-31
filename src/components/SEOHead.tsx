'use client';

import Script from 'next/script';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  breadcrumbs?: Array<{name: string; url: string}>;
  products?: Array<{name: string; price: number; currency: string}>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  breadcrumbs,
  products
}) => {
  const fullTitle = title.includes('AI Business Card Scanner') ? title : `${title} | AI Business Card Scanner`;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Business Card Scanner",
    "description": description,
    "url": siteUrl,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "MYR",
      "description": "Free plan available"
    },
    "creator": {
      "@type": "Organization",
      "name": "AI Business Card Scanner"
    }
  };

  const faqSchema = title.includes('FAQ') ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How accurate is the AI extraction?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI achieves 99%+ accuracy in extracting contact information from business cards, including names, emails, phones, and addresses."
        }
      },
      {
        "@type": "Question",
        "name": "What file formats are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support JPG, PNG, and PDF files. Simply upload your business card image and our AI will extract all the information."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all data is processed securely and encrypted. We don't store your business card images after processing."
        }
      }
    ]
  } : null;

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 1 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${siteUrl}${crumb.url}`
    }))
  } : null;

  const productSchema = products && products.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "AI Business Card Scanner Plans",
    "description": description,
    "offers": products.map(product => ({
      "@type": "Offer",
      "name": product.name,
      "price": product.price.toString(),
      "priceCurrency": product.currency,
      "availability": "https://schema.org/InStock",
      "url": currentUrl
    }))
  } : null;

  return (
    <>
      {/* Note: In Next.js, title and meta tags should be handled via metadata export in page.tsx or layout.tsx */}
      {/* This component now only handles JSON-LD structured data */}
      
      <Script
        id="base-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(baseSchema) }}
      />
      
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      
      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
    </>
  );
};
