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
  const [networkIp, setNetworkIp] = useState<string>("192.168.4.26"); // Default IP
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Get the current window location
    const currentUrl = window.location.href;
    // Remove any query parameters that might cause issues
    const cleanUrl = currentUrl.split('?')[0];
    
    // Replace localhost with the actual IP address for mobile access
    let accessibleUrl = cleanUrl;
    if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
      // Replace localhost with the computer's network IP
      accessibleUrl = cleanUrl.replace(
        /(https?:\/\/)(localhost|127\.0\.0\.1)(:[0-9]+)?(\/?.*)/, 
        `$1${networkIp}$3$4`
      );
    }
    
    setAppUrl(accessibleUrl);
    
    // Generate QR code URL with higher resolution and error correction
    const qrUrl = `${QR_CODE_API}?size=300x300&ecc=H&data=${encodeURIComponent(accessibleUrl)}`;
    setQrCodeUrl(qrUrl);
  }, [networkIp]);

  // Function to handle IP address change
  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkIp(e.target.value);
  };

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
          <div className="w-full mb-2">
            <label htmlFor="networkIp" className="text-sm font-medium">
              Your Network IP Address:
            </label>
            <input
              id="networkIp"
              type="text"
              value={networkIp}
              onChange={handleIpChange}
              className="w-full p-2 mt-1 border rounded-md text-sm"
              placeholder="192.168.x.x"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This should match your computer's network IP address
            </p>
          </div>
          
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