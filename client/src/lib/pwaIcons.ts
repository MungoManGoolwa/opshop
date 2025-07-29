// PWA Icon Generator - Creates SVG-based icons for different sizes
export function generateIcon(size: number): string {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e"/>
          <stop offset="100%" style="stop-color:#16a34a"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fbbf24"/>
          <stop offset="100%" style="stop-color:#f59e0b"/>
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size * 0.2}"/>
      
      <!-- Main shopping bag shape -->
      <g transform="translate(${size * 0.2}, ${size * 0.15})">
        <!-- Bag body -->
        <rect x="0" y="${size * 0.25}" width="${size * 0.6}" height="${size * 0.5}" 
              fill="white" rx="${size * 0.05}" opacity="0.95"/>
        
        <!-- Bag handles -->
        <path d="M ${size * 0.15} ${size * 0.25} 
                 Q ${size * 0.15} ${size * 0.1} ${size * 0.25} ${size * 0.1}
                 Q ${size * 0.35} ${size * 0.1} ${size * 0.35} ${size * 0.25}"
              fill="none" stroke="white" stroke-width="${size * 0.02}" opacity="0.95"/>
        <path d="M ${size * 0.45} ${size * 0.25} 
                 Q ${size * 0.45} ${size * 0.1} ${size * 0.35} ${size * 0.1}
                 Q ${size * 0.25} ${size * 0.1} ${size * 0.25} ${size * 0.25}"
              fill="none" stroke="white" stroke-width="${size * 0.02}" opacity="0.95"/>
        
        <!-- Recycle symbol -->
        <g transform="translate(${size * 0.05}, ${size * 0.35})" fill="url(#accent)">
          <circle cx="${size * 0.25}" cy="${size * 0.2}" r="${size * 0.15}" fill="none" 
                  stroke="url(#accent)" stroke-width="${size * 0.02}" opacity="0.8"
                  stroke-dasharray="${size * 0.1} ${size * 0.05}"/>
          <polygon points="${size * 0.25},${size * 0.08} ${size * 0.22},${size * 0.12} ${size * 0.28},${size * 0.12}"
                   fill="url(#accent)"/>
          <polygon points="${size * 0.37},${size * 0.25} ${size * 0.34},${size * 0.21} ${size * 0.34},${size * 0.29}"
                   fill="url(#accent)"/>
          <polygon points="${size * 0.13},${size * 0.25} ${size * 0.16},${size * 0.29} ${size * 0.16},${size * 0.21}"
                   fill="url(#accent)"/>
        </g>
      </g>
    </svg>
  `)}`);
}

// Generate and save icons for PWA (browser only)
export function generatePWAIcons() {
  if (typeof document === 'undefined') return;
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  sizes.forEach(size => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = size;
    canvas.height = size;
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      
      // Convert to blob and create download link
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `icon-${size}x${size}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    
    img.src = generateIcon(size);
  });
}