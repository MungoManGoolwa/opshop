import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Facebook, Twitter, MessageCircle, Mail, Link, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonProps {
  title: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  price?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function SocialShareButton({
  title,
  description = "",
  imageUrl = "",
  url,
  price,
  className = "",
  variant = "outline",
  size = "sm"
}: SocialShareButtonProps) {
  const { toast } = useToast();
  const shareUrl = url || window.location.href;
  const shareTitle = price ? `${title} - ${price}` : title;
  const shareDescription = description || `Check out this item on Opshop Online - Australia's sustainable marketplace for pre-loved goods.`;

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

  const handleEmailShare = () => {
    const emailSubject = `Check out: ${shareTitle}`;
    const emailBody = `Hi!\n\nI found this interesting item on Opshop Online:\n\n${shareTitle}\n${shareDescription}\n\nView it here: ${shareUrl}\n\nOpshop Online - Australia's sustainable marketplace for pre-loved goods.`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = emailUrl;
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Native sharing cancelled or failed');
      }
    }
  };

  // Check if native sharing is available (mobile devices)
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
              <Share2 className="h-4 w-4 mr-2" />
              Share via...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          Share on Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
          Share on WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2 text-gray-600" />
          Share via Email
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}