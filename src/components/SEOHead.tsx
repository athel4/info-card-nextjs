import { Helmet } from 'react-helmet-async';

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
  keywords,
  ogImage = '/og-image.jpg',
  canonical,
  breadcrumbs,
  products
}) => {
  const fullTitle = title.includes('AI Business Card Scanner') ? title : `${title} | AI Business Card Scanner`;
  const siteUrl = window.location.origin;
  const currentUrl = canonical || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="AI Business Card Scanner" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
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
        })}
      </script>
      
      {/* FAQ Schema for FAQ page */}
      {title.includes('FAQ') && (
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      )}
      
      {/* Breadcrumb Schema */}
      {breadcrumbs && breadcrumbs.length > 1 && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": crumb.name,
              "item": `${siteUrl}${crumb.url}`
            }))
          })}
        </script>
      )}
      
      {/* Product Schema */}
      {products && products.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      )}
    </Helmet>
  );
};