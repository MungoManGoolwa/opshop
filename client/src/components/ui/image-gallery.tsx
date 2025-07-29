import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, RotateCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  title?: string;
  className?: string;
  showThumbnails?: boolean;
  enableZoom?: boolean;
  enableDownload?: boolean;
}

export function ImageGallery({ 
  images, 
  title = "Product Images", 
  className,
  showThumbnails = true,
  enableZoom = true,
  enableDownload = false
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Filter out empty or invalid images
  const validImages = images.filter(img => img && img.trim() !== '');

  if (validImages.length === 0) {
    return (
      <div className={cn("bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center", className)}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
    resetImageState();
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    resetImageState();
  };

  const resetImageState = () => {
    setZoomLevel(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `${title.replace(/\s+/g, '_')}_${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isModalOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case 'Escape':
        setIsModalOpen(false);
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        handleRotate();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, currentIndex]);

  useEffect(() => {
    if (isModalOpen) {
      resetImageState();
    }
  }, [isModalOpen, currentIndex]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image with Hover Zoom */}
      <div className="relative group overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <div className="relative cursor-zoom-in">
              <img
                src={currentImage}
                alt={`${title} - Image ${currentIndex + 1}`}
                className="w-full h-64 md:h-96 object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {validImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {validImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {validImages.length}
                  </div>
                </div>
              )}
            </div>
          </DialogTrigger>

          {/* Lightbox Modal */}
          <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-0">
            <div className="relative w-full h-[95vh] flex flex-col">
              {/* Header Controls */}
              <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
                <div className="text-white font-medium">
                  {title} - {currentIndex + 1} of {validImages.length}
                </div>
                <div className="flex items-center space-x-2">
                  {enableZoom && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        className="text-white hover:bg-white/20"
                      >
                        <span className="text-lg">−</span>
                      </Button>
                      <span className="text-white text-sm min-w-[3rem] text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        className="text-white hover:bg-white/20"
                      >
                        <span className="text-lg">+</span>
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRotate}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  {enableDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="text-white hover:bg-white/20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Main Image */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <img
                  ref={imageRef}
                  src={currentImage}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  className={cn(
                    "max-w-none transition-transform duration-200",
                    zoomLevel > 1 ? "cursor-move" : "cursor-zoom-in"
                  )}
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                    maxHeight: zoomLevel === 1 ? '80vh' : 'none',
                    maxWidth: zoomLevel === 1 ? '90vw' : 'none'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={zoomLevel === 1 ? handleZoomIn : undefined}
                  draggable={false}
                />
              </div>

              {/* Navigation Arrows */}
              {validImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 h-16 w-16"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 h-16 w-16"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Bottom Navigation Dots */}
              {validImages.length > 1 && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-2">
                    {validImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-200",
                          index === currentIndex
                            ? "bg-white scale-125"
                            : "bg-white/50 hover:bg-white/75"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnail Strip */}
      {showThumbnails && validImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200",
                index === currentIndex
                  ? "border-green-500 ring-2 ring-green-500/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {isModalOpen && (
        <div className="absolute bottom-4 left-4 text-white/70 text-xs bg-black/50 px-3 py-2 rounded">
          <div>← → Navigate • + - Zoom • R Rotate • ESC Close</div>
        </div>
      )}
    </div>
  );
}