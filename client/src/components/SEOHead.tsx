import { Helmet } from 'react-helmet-async';
import { 
  truncateDescription, 
  generateProductStructuredData, 
  generateOpenGraphTags, 
  generateTwitterCardTags,
  generateCanonicalUrl,
  seoConfig 
} from '@/utils/seoUtils';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: string;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'New' | 'Used' | 'Refurbished';
  location?: string;
  category?: string;
}

const defaultMeta = {
  title: 'Opshop Online - Australia\'s Sustainable Marketplace',
  description: 'Buy and sell quality second-hand goods across Australia. Discover unique pre-loved items, electronics, fashion, home goods and more. Sustainable shopping made easy.',
  keywords: 'second hand, pre-loved, sustainable shopping, marketplace, Australia, buy sell, electronics, fashion, furniture',
  image: '/opshop-og-image.jpg',
  url: 'https://opshop.online'
};

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  price,
  currency = 'AUD',
  availability,
  condition,
  location,
  category
}: SEOHeadProps) {
  const pageTitle = title ? `${title} | Opshop Online` : defaultMeta.title;
  const pageDescription = description || defaultMeta.description;
  const pageKeywords = keywords ? `${keywords}, ${defaultMeta.keywords}` : defaultMeta.keywords;
  const pageImage = image || defaultMeta.image;
  const pageUrl = url ? `${defaultMeta.url}${url}` : defaultMeta.url;

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Opshop Online",
    "description": "Australia's sustainable marketplace for second-hand goods",
    "url": defaultMeta.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${defaultMeta.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // Add product-specific structured data
  if (type === 'product' && price) {
    structuredData["@type"] = "Product";
    structuredData.offers = {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": `https://schema.org/${availability || 'InStock'}`,
      "itemCondition": `https://schema.org/${condition || 'Used'}Condition`
    };
    if (location) {
      structuredData.offers.availableAtOrFrom = {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": location,
          "addressCountry": "AU"
        }
      };
    }
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Opshop Online" />
      <meta property="og:locale" content="en_AU" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Opshop Online" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Geographic Tags for Australian Market */}
      <meta name="geo.region" content="AU" />
      <meta name="geo.placename" content="Australia" />
      <meta name="DC.title" content={pageTitle} />

      {/* Product-specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
          {availability && <meta property="product:availability" content={availability} />}
          {condition && <meta property="product:condition" content={condition} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}