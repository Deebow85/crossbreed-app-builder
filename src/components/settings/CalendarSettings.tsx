
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AppSettings } from "@/types/settings"
import { useToast } from "@/components/ui/use-toast"

interface CalendarSettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export function CalendarSettings({ settings, onSave }: CalendarSettingsProps) {
  const { toast } = useToast();
  
  const handleShowIconTitlesChange = (checked: boolean) => {
    const newSettings = {
      ...settings,
      showIconTitles: checked
    };
    onSave(newSettings);
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    // Show toast
    toast({
      title: "Icon titles " + (checked ? "enabled" : "disabled"),
      description: "Navigation bar has been updated",
    });
  };
  
  return (
    <div className="space-y-4 p-2">
      <div className="grid gap-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-overlapping-dates" 
            checked={settings.showOverlappingDates}
            onCheckedChange={(checked) => {
              onSave({
                ...settings,
                showOverlappingDates: checked
              });
            }}
          />
          <Label htmlFor="show-overlapping-dates">Show Overlapping Dates</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="long-press-enabled" 
            checked={settings.longPressEnabled}
            onCheckedChange={(checked) => {
              onSave({
                ...settings,
                longPressEnabled: checked
              });
            }}
          />
          <Label htmlFor="long-press-enabled">Long Press for Quick Actions</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-icon-titles" 
            checked={settings.showIconTitles}
            onCheckedChange={handleShowIconTitlesChange}
          />
          <Label htmlFor="show-icon-titles">Show Icon Titles</Label>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-sm">Calendar Size</h3>
        <RadioGroup 
          value={settings.calendarSize} 
          onValueChange={(value) => {
            if (value === 'small' || value === 'large') {
              onSave({
                ...settings,
                calendarSize: value
              });
            }
          }}
          className="flex space-x-1"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="small" id="r1" />
            <Label htmlFor="r1">Small</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="large" id="r2" />
            <Label htmlFor="r2">Large</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-sm">Date Number Position</h3>
        <RadioGroup 
          value={settings.calendarNumberLayout} 
          onValueChange={(value) => {
            if (value === 'centre' || value === 'top-left' || value === 'top-right') {
              onSave({
                ...settings,
                calendarNumberLayout: value
              });
            }
          }}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="centre" id="n1" />
            <Label htmlFor="n1">Center</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="top-left" id="n2" />
            <Label htmlFor="n2">Top Left</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="top-right" id="n3" />
            <Label htmlFor="n3">Top Right</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
