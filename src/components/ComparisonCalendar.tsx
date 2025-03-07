import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { SplitSquareHorizontal, X } from "lucide-react";

interface ComparisonCalendarProps {
  currentDate: Date;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
}

export function ComparisonCalendar({ currentDate, selectedDate, onDateSelect }: ComparisonCalendarProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleRemoveImage = () => {
    setUploadedImage(null);
    localStorage.removeItem('calendarComparisonImage');
  };

  // Load saved image on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('calendarComparisonImage');
    if (savedImage) {
      setUploadedImage(savedImage);
    }
    
    // Listen for storage events to update the image when changed in settings
    const handleStorageChange = () => {
      const savedImage = localStorage.getItem('calendarComparisonImage');
      setUploadedImage(savedImage);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="relative ComparisonCalendar">
      <div className="absolute right-0 top-0 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowComparison(!showComparison)}
          className="bg-background"
        >
          <SplitSquareHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className={`grid transition-all ${showComparison ? 'grid-rows-2 gap-4' : 'grid-rows-1'}}`}>
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