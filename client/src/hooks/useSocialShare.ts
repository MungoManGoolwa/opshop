import { useToast } from "@/hooks/use-toast";

interface ShareData {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  price?: string;
}

export function useSocialShare() {
  const { toast } = useToast();

  const shareToFacebook = (data: ShareData) => {
    const shareUrl = data.url || window.location.href;
    const shareTitle = data.price ? `${data.title} - ${data.price}` : data.title;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = (data: ShareData) => {
    const shareUrl = data.url || window.location.href;
    const shareTitle = data.price ? `${data.title} - ${data.price}` : data.title;
    const shareDescription = data.description || "Check out this item on Opshop Online";
    const twitterText = `${shareTitle} ${shareDescription}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = (data: ShareData) => {
    const shareUrl = data.url || window.location.href;
    const shareTitle = data.price ? `${data.title} - ${data.price}` : data.title;
    const shareDescription = data.description || "Check out this item on Opshop Online";
    const whatsAppText = `${shareTitle}\n${shareDescription}\n${shareUrl}`;
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(whatsAppText)}`;
    window.open(whatsAppUrl, '_blank');
  };

  const shareViaEmail = (data: ShareData) => {
    const shareUrl = data.url || window.location.href;
    const shareTitle = data.price ? `${data.title} - ${data.price}` : data.title;
    const shareDescription = data.description || "Check out this item on Opshop Online";
    const emailSubject = `Check out: ${shareTitle}`;
    const emailBody = `Hi!\n\nI found this interesting item on Opshop Online:\n\n${shareTitle}\n${shareDescription}\n\nView it here: ${shareUrl}\n\nOpshop Online - Australia's sustainable marketplace for pre-loved goods.`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = emailUrl;
  };

  const copyLink = async (url?: string) => {
    const shareUrl = url || window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard.",
      });
      return true;
    } catch (error) {
      // Fallback for older browsers
      try {
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
        return true;
      } catch (fallbackError) {
        toast({
          title: "Copy failed",
          description: "Unable to copy link to clipboard.",
          variant: "destructive",
        });
        return false;
      }
    }
  };

  const shareNatively = async (data: ShareData) => {
    if (!navigator.share) {
      return false;
    }

    try {
      const shareUrl = data.url || window.location.href;
      const shareTitle = data.price ? `${data.title} - ${data.price}` : data.title;
      const shareDescription = data.description || "Check out this item on Opshop Online";

      await navigator.share({
        title: shareTitle,
        text: shareDescription,
        url: shareUrl,
      });
      return true;
    } catch (error) {
      // User cancelled sharing or error occurred
      console.log('Native sharing cancelled or failed');
      return false;
    }
  };

  const hasNativeShare = () => {
    return typeof navigator !== 'undefined' && 'share' in navigator && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return {
    shareToFacebook,
    shareToTwitter,
    shareToWhatsApp,
    shareViaEmail,
    copyLink,
    shareNatively,
    hasNativeShare: hasNativeShare(),
  };
}