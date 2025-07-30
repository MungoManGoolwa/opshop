// SEO utility functions for comprehensive search engine optimization

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultAuthor: string;
  twitterHandle?: string;
  facebookAppId?: string;
}

const defaultConfig: SEOConfig = {
  siteName: "Opshop Online",
  siteUrl: "https://opshop.online",
  defaultDescription: "Australia's premier second-hand marketplace for sustainable shopping. Buy and sell pre-loved items with confidence.",
  defaultKeywords: ["second hand", "pre-loved", "sustainable shopping", "marketplace", "Australia", "opshop", "thrift"],
  defaultAuthor: "Opshop Online",
  twitterHandle: "@opshop_online",
};

export const seoConfig = defaultConfig;

/**
 * Truncate description to optimal length for meta descriptions
 */
export function truncateDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Generate structured data for products
 */
export function generateProductStructuredData(product: {
  title: string;
  price: number;
  description: string;
  condition: string;
  category: string;
  location: string;
  images?: string[];
  seller?: { name: string };
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "description": truncateDescription(product.description),
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "AUD",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "condition": product.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      "seller": {
        "@type": "Organization",
        "name": product.seller?.name || "Opshop Online Seller"
      }
    },
    "image": product.images?.[0] ? [product.images[0]] : undefined,
    "brand": {
      "@type": "Brand",
      "name": "Second-Hand"
    }
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${seoConfig.siteUrl}${crumb.url}`
    }))
  };
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": seoConfig.siteName,
    "url": seoConfig.siteUrl,
    "description": seoConfig.defaultDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${seoConfig.siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(data: {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  siteName?: string;
}) {
  return {
    "og:title": data.title,
    "og:description": truncateDescription(data.description),
    "og:url": data.url || window.location.href,
    "og:type": data.type || "website",
    "og:site_name": data.siteName || seoConfig.siteName,
    "og:image": data.image || `${seoConfig.siteUrl}/og-image.jpg`,
    "og:locale": "en_AU"
  };
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(data: {
  title: string;
  description: string;
  image?: string;
  site?: string;
}) {
  return {
    "twitter:card": "summary_large_image",
    "twitter:title": data.title,
    "twitter:description": truncateDescription(data.description, 200),
    "twitter:image": data.image || `${seoConfig.siteUrl}/twitter-image.jpg`,
    "twitter:site": data.site || seoConfig.twitterHandle
  };
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path?: string): string {
  const cleanPath = path?.replace(/\?.*$/, '') || window.location.pathname;
  return `${seoConfig.siteUrl}${cleanPath}`;
}

/**
 * Generate hreflang tags for internationalization
 */
export function generateHreflangTags(currentPath: string) {
  return {
    "hreflang": {
      "en-au": `${seoConfig.siteUrl}${currentPath}`,
      "en": `${seoConfig.siteUrl}${currentPath}`,
      "x-default": `${seoConfig.siteUrl}${currentPath}`
    }
  };
}

/**
 * SEO testing utility
 */
export class SEOTester {
  static testPageSEO() {
    const results = {
      title: this.testTitle(),
      description: this.testDescription(),
      keywords: this.testKeywords(),
      openGraph: this.testOpenGraph(),
      twitterCard: this.testTwitterCard(),
      structuredData: this.testStructuredData(),
      canonical: this.testCanonical(),
      hreflang: this.testHreflang()
    };

    console.group('🔍 SEO Analysis Results');
    Object.entries(results).forEach(([test, result]) => {
      console.log(`${result.pass ? '✅' : '❌'} ${test}: ${result.message}`);
    });
    console.groupEnd();

    return results;
  }

  private static testTitle() {
    const title = document.title;
    const length = title.length;
    
    if (!title) return { pass: false, message: 'No title found' };
    if (length < 30) return { pass: false, message: `Title too short (${length} chars, min 30)` };
    if (length > 60) return { pass: false, message: `Title too long (${length} chars, max 60)` };
    
    return { pass: true, message: `Good length (${length} chars)` };
  }

  private static testDescription() {
    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    if (!desc) return { pass: false, message: 'No meta description found' };
    
    const length = desc.length;
    if (length < 120) return { pass: false, message: `Description too short (${length} chars, min 120)` };
    if (length > 160) return { pass: false, message: `Description too long (${length} chars, max 160)` };
    
    return { pass: true, message: `Good length (${length} chars)` };
  }

  private static testKeywords() {
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
    
    if (!keywords) return { pass: false, message: 'No keywords meta tag found' };
    
    const keywordCount = keywords.split(',').length;
    if (keywordCount < 3) return { pass: false, message: `Too few keywords (${keywordCount}, min 3)` };
    if (keywordCount > 10) return { pass: false, message: `Too many keywords (${keywordCount}, max 10)` };
    
    return { pass: true, message: `Good keyword count (${keywordCount})` };
  }

  private static testOpenGraph() {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (!ogTitle || !ogDesc || !ogImage) {
      return { pass: false, message: 'Missing Open Graph tags' };
    }
    
    return { pass: true, message: 'All essential Open Graph tags present' };
  }

  private static testTwitterCard() {
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    
    if (!twitterCard || !twitterTitle) {
      return { pass: false, message: 'Missing Twitter Card tags' };
    }
    
    return { pass: true, message: 'Twitter Card tags present' };
  }

  private static testStructuredData() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    if (scripts.length === 0) {
      return { pass: false, message: 'No structured data found' };
    }
    
    try {
      scripts.forEach(script => JSON.parse(script.textContent || ''));
      return { pass: true, message: `${scripts.length} valid structured data blocks found` };
    } catch (e) {
      return { pass: false, message: 'Invalid JSON in structured data' };
    }
  }

  private static testCanonical() {
    const canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) return { pass: false, message: 'No canonical URL found' };
    
    return { pass: true, message: 'Canonical URL present' };
  }

  private static testHreflang() {
    const hreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    
    if (hreflang.length === 0) {
      return { pass: false, message: 'No hreflang tags found' };
    }
    
    return { pass: true, message: `${hreflang.length} hreflang tags found` };
  }
}

// Make SEO tester available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).SEOTester = SEOTester;
}