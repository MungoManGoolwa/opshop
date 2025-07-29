import { Button } from "@/components/ui/button";
import { Facebook, Twitter, MessageCircle, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  price?: string;
  className?: string;
}

export function QuickShareButtons({
  title,
  description = "",
  url,
  price,
  className = ""
}: QuickShareButtonsProps) {
  const { toast } = useToast();
  const shareUrl = url || window.location.href;
  const shareTitle = price ? `${title} - ${price}` : title;
  const shareDescription = description || `Check out this item on Opshop Online - Australia's sustainable marketplace.`;

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterText = `${shareTitle} ${shareDescription}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const whatsAppText = `${shareTitle}\n${shareDescription}\n${shareUrl}`;
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(whatsAppText)}`;
    window.open(whatsAppUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard.",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline" 
        size="sm"
        onClick={handleFacebookShare}
        className="px-2"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4 text-blue-600" />
      </Button>
      
      <Button
        variant="outline" 
        size="sm"
        onClick={handleTwitterShare}
        className="px-2"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4 text-blue-400" />
      </Button>
      
      <Button
        variant="outline" 
        size="sm"
        onClick={handleWhatsAppShare}
        className="px-2"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-green-500" />
      </Button>
      
      <Button
        variant="outline" 
        size="sm"
        onClick={handleCopyLink}
        className="px-2"
        title="Copy Link"
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
}