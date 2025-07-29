import { useEffect } from "react";

interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  price?: string;
  availability?: string;
  condition?: string;
  location?: string;
}

export function useSEO(data: SEOData) {
  useEffect(() => {
    // Set document title
    document.title = data.title;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('meta[data-seo="true"]');
    existingMetas.forEach(meta => meta.remove());

    // Create meta tags
    const metaTags = [
      // Standard meta tags
      { name: "description", content: data.description },
      { name: "keywords", content: "second hand, pre-loved, sustainable shopping, Australia, marketplace, opshop" },
      { name: "author", content: "Opshop Online" },
      
      // Open Graph tags
      { property: "og:title", content: data.title },
      { property: "og:description", content: data.description },
      { property: "og:type", content: data.type || "website" },
      { property: "og:url", content: data.url || window.location.href },
      { property: "og:site_name", content: data.siteName || "Opshop Online" },
      { property: "og:locale", content: "en_AU" },
      
      // Twitter Card tags
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: data.title },
      { name: "twitter:description", content: data.description },
      { name: "twitter:site", content: "@OpshopOnline" },
      
      // Additional meta tags for products
      ...(data.price ? [
        { property: "product:price:amount", content: data.price },
        { property: "product:price:currency", content: "AUD" },
      ] : []),
      
      ...(data.availability ? [
        { property: "product:availability", content: data.availability },
      ] : []),
      
      ...(data.condition ? [
        { property: "product:condition", content: data.condition },
      ] : []),
      
      ...(data.location ? [
        { name: "geo.region", content: "AU" },
        { name: "geo.placename", content: data.location },
      ] : []),
    ];

    // Add image tags if provided
    if (data.image) {
      metaTags.push(
        { property: "og:image", content: data.image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: data.title },
        { name: "twitter:image", content: data.image },
        { name: "twitter:image:alt", content: data.title }
      );
    }

    // Create and append meta elements
    metaTags.forEach(tag => {
      const meta = document.createElement("meta");
      meta.setAttribute("data-seo", "true");
      
      if ('name' in tag) {
        meta.name = tag.name;
      } else if ('property' in tag) {
        meta.setAttribute("property", tag.property);
      }
      
      meta.content = tag.content;
      document.head.appendChild(meta);
    });

    // Add structured data for products
    if (data.type === "product" && data.price) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.title,
        "description": data.description,
        "offers": {
          "@type": "Offer",
          "price": data.price,
          "priceCurrency": "AUD",
          "availability": data.availability === "in-stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "itemCondition": getSchemaCondition(data.condition || "used"),
        },
        ...(data.image && { "image": data.image }),
        ...(data.location && { "availableAtOrFrom": { "@type": "Place", "name": data.location } }),
      };

      // Remove existing structured data
      const existingScript = document.querySelector('script[data-seo="structured-data"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "structured-data");
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const seoMetas = document.querySelectorAll('meta[data-seo="true"]');
      seoMetas.forEach(meta => meta.remove());
      
      const seoScript = document.querySelector('script[data-seo="structured-data"]');
      if (seoScript) {
        seoScript.remove();
      }
    };
  }, [data]);
}

function getSchemaCondition(condition?: string): string {
  switch (condition?.toLowerCase()) {
    case "new":
    case "like new":
      return "https://schema.org/NewCondition";
    case "excellent":
    case "very good":
      return "https://schema.org/UsedCondition";
    case "good":
    case "fair":
      return "https://schema.org/UsedCondition";
    case "poor":
      return "https://schema.org/DamagedCondition";
    default:
      return "https://schema.org/UsedCondition";
  }
}

// Helper function to generate SEO-friendly URLs
export function generateSEOUrl(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return `/product/${id}/${slug}`;
}

// Helper function to truncate description for meta tags
export function truncateDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) {
    return description;
  }
  
  return description.substring(0, maxLength - 3).trim() + '...';
}