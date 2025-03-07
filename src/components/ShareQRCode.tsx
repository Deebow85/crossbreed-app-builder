import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Share, Download, Smartphone } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useIsMobile } from "../hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const QR_CODE_API = "https://api.qrserver.com/v1/create-qr-code/";

export function ShareQRCode() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [appUrl, setAppUrl] = useState<string>("");
  const [networkIp, setNetworkIp] = useState<string>("192.168.4.26"); // Default IP
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if app is already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

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

  // If already on mobile, just show the direct link and install options
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        {isPwaInstalled ? (
          <>
            <h2 className="text-lg font-semibold">You're using the installed app!</h2>
            <p className="text-sm text-center">This app is already installed on your device and can work offline.</p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Install for Offline Use</h2>
            <p className="text-sm text-center">Add this app to your home screen to use it offline:</p>
            <ol className="text-sm list-decimal pl-5 space-y-2">
              <li>Tap the share button in your browser</li>
              <li>Select "Add to Home Screen" or "Install App"</li>
              <li>Follow the prompts to install</li>
            </ol>
          </>
        )}
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
          <DialogTitle>Share & Access Options</DialogTitle>
          <DialogDescription>
            Share this app or set it up for offline use on your mobile device.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="share">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="offline">Offline Use</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="offline" className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              
              <h3 className="text-lg font-medium text-center">Use This App Offline</h3>
              <p className="text-sm text-center">
                This app can work without an internet connection after installation.
              </p>
              
              <div className="space-y-4 w-full">
                <div className="border rounded-md p-3 space-y-2">
                  <h4 className="font-medium">Install as App (Recommended)</h4>
                  <ol className="text-sm list-decimal pl-5 space-y-1">
                    <li>Open this app in Chrome/Safari on your mobile device</li>
                    <li>Tap the browser menu (⋮ or ⋯)</li>
                    <li>Select "Add to Home Screen" or "Install App"</li>
                    <li>Once installed, the app will work offline</li>
                  </ol>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => {
                      toast({
                        title: "Installation Instructions",
                        description: "Open this app on your mobile device and follow the steps above",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install Instructions
                  </Button>
                </div>
                
                <div className="border rounded-md p-3 space-y-2">
                  <h4 className="font-medium">Build for Offline Use</h4>
                  <p className="text-sm">
                    For complete offline use, you can build the app and transfer the files to your device.
                  </p>
                  <ol className="text-sm list-decimal pl-5 space-y-1">
                    <li>Run <code>npm run build</code> on your computer</li>
                    <li>Transfer the <code>dist</code> folder to your device</li>
                    <li>Open the <code>index.html</code> file in your mobile browser</li>
                  </ol>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}