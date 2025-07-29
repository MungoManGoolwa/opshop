import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoomImageProps {
  src: string;
  alt: string;
  className?: string;
  zoomScale?: number;
  enableHoverZoom?: boolean;
  enableClickZoom?: boolean;
}

export function ZoomImage({ 
  src, 
  alt, 
  className,
  zoomScale = 2,
  enableHoverZoom = true,
  enableClickZoom = false
}: ZoomImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableHoverZoom || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (enableHoverZoom) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsZoomed(false);
  };

  const handleClick = () => {
    if (enableClickZoom) {
      setIsZoomed(!isZoomed);
    }
  };

  const transformOrigin = `${mousePosition.x}% ${mousePosition.y}%`;
  const shouldZoom = enableHoverZoom ? isHovered : isZoomed;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg group",
        enableClickZoom && "cursor-zoom-in",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt || "Product image - hover to zoom for detailed view"}
        className={cn(
          "w-full h-full object-cover transition-transform duration-300 ease-out",
          shouldZoom && `scale-${Math.floor(zoomScale * 100)}`
        )}
        style={{
          transformOrigin: shouldZoom ? transformOrigin : 'center',
          transform: shouldZoom ? `scale(${zoomScale})` : 'scale(1)'
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-image.jpg';
          target.alt = "Product image placeholder - original image unavailable";
        }}
      />
      
      {/* Zoom Indicator */}
      {(enableHoverZoom || enableClickZoom) && (
        <div className={cn(
          "absolute inset-0 bg-black/0 transition-all duration-300 flex items-center justify-center",
          isHovered && enableHoverZoom && "bg-black/10",
          !shouldZoom && "group-hover:bg-black/10"
        )}>
          <div className={cn(
            "bg-black/50 text-white p-2 rounded-full transition-opacity duration-300",
            shouldZoom ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          )}>
            {shouldZoom ? (
              <ZoomOut className="h-5 w-5" />
            ) : (
              <ZoomIn className="h-5 w-5" />
            )}
          </div>
        </div>
      )}

      {/* Magnifier Glass Effect (Optional) */}
      {enableHoverZoom && isHovered && (
        <div 
          className="absolute pointer-events-none border-2 border-white/50 rounded-full bg-black/20"
          style={{
            width: '80px',
            height: '80px',
            left: `calc(${mousePosition.x}% - 40px)`,
            top: `calc(${mousePosition.y}% - 40px)`,
            transform: 'translate(0, 0)',
            transition: 'none'
          }}
        />
      )}
    </div>
  );
}