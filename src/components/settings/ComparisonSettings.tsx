import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppSettings } from "@/types/settings";

interface ComparisonSettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function ComparisonSettings({ settings, onSave }: ComparisonSettingsProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved image on component mount
    const savedImage = localStorage.getItem('calendarComparisonImage');
    if (savedImage) {
      setUploadedImage(savedImage);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImage(base64String);
        localStorage.setItem('calendarComparisonImage', base64String);
        
        toast({
          title: "Image uploaded",
          description: "Your comparison calendar image has been saved.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    localStorage.removeItem('calendarComparisonImage');
    
    toast({
      title: "Image removed",
      description: "Your comparison calendar image has been removed.",
    });
  };

  return (
    <div className="space-y-4 p-2">
      <div className="grid gap-2">
        <Label htmlFor="comparison-image">Calendar Comparison Image</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Upload an image of another calendar to compare with your shift calendar.
        </p>
        
        {uploadedImage ? (
          <div className="relative border rounded-md overflow-hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 z-10 bg-background"
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={uploadedImage}
              alt="Comparison Calendar"
              className="w-full h-auto max-h-[300px] object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
            <p className="text-sm text-muted-foreground mb-4">No image uploaded</p>
            <label className="cursor-pointer">
              <input
                id="comparison-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button variant="outline" className="bg-background">
                <Image className="h-4 w-4 mr-2" />
                <span>Upload Image</span>
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}