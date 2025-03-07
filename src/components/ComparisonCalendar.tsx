import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Image, SplitSquareHorizontal, X } from "lucide-react";

interface ComparisonCalendarProps {
  currentDate: Date;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
}

export function ComparisonCalendar({ currentDate, selectedDate, onDateSelect }: ComparisonCalendarProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImage(base64String);
        localStorage.setItem('calendarComparisonImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    localStorage.removeItem('calendarComparisonImage');
  };

  // Load saved image on component mount
  useState(() => {
    const savedImage = localStorage.getItem('calendarComparisonImage');
    if (savedImage) {
      setUploadedImage(savedImage);
    }
  });

  return (
    <div className="relative">
      <div className="absolute right-0 top-0 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowComparison(!showComparison)}
          className="bg-background"
        >
          <SplitSquareHorizontal className="h-4 w-4" />
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button variant="outline" size="icon" className="bg-background" asChild>
            <span>
              <Image className="h-4 w-4" />
            </span>
          </Button>
        </label>
      </div>

      <div className={`grid transition-all ${showComparison ? 'grid-cols-2 gap-4' : 'grid-cols-1'}}`}>
        <Card className="relative overflow-hidden">
          <CalendarUI
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            initialFocus
            className="mx-auto"
          />
        </Card>

        {showComparison && (
          <Card className="relative overflow-hidden">
            {uploadedImage ? (
              <div className="relative">
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
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Upload an image to compare calendars</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}