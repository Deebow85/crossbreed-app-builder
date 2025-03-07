import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Share } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useIsMobile } from "../hooks/use-mobile";

const QR_CODE_API = "https://api.qrserver.com/v1/create-qr-code/";

export function ShareQRCode() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [appUrl, setAppUrl] = useState<string>("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Get the app URL from the capacitor config or use the current URL if not available
    const hostedAppUrl = "https://29ba2954-667b-4ebd-9b92-e8e6252aa0d3.lovableproject.com?forceHideBadge=true";
    setAppUrl(hostedAppUrl);
    
    // Generate QR code URL
    const qrUrl = `${QR_CODE_API}?size=200x200&data=${encodeURIComponent(hostedAppUrl)}`;
    setQrCodeUrl(qrUrl);
  }, []);

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Share this link with others to access the app",
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually",
        variant: "destructive"
      });
    });
  };

  const openAppInBrowser = () => {
    window.open(appUrl, '_blank');
  };

  // If already on mobile, just show the direct link
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <h2 className="text-lg font-semibold">You're already on mobile!</h2>
        <p className="text-sm text-center">You can bookmark this page or share the link below:</p>
        <div className="flex flex-col w-full space-y-2">
          <Button onClick={copyLinkToClipboard} className="w-full">
            Copy Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share to Mobile</DialogTitle>
          <DialogDescription>
            Scan this QR code with your phone's camera to open the app on your mobile device.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          {qrCodeUrl && (
            <div className="border rounded-lg p-2 bg-white">
              <img src={qrCodeUrl} alt="QR Code" width={200} height={200} />
            </div>
          )}
          <p className="text-sm text-center">Or share the link directly:</p>
          <div className="flex flex-col w-full space-y-2">
            <Button onClick={copyLinkToClipboard} className="w-full">
              Copy Link
            </Button>
            <Button onClick={openAppInBrowser} variant="outline" className="w-full">
              Open in Browser
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}