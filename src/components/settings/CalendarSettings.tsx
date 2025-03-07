
import { PillSwitch } from "@/components/ui/pill-switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { AppSettings } from "@/types/settings"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

interface CalendarSettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export function CalendarSettings({ settings, onSave }: CalendarSettingsProps) {
  const { toast } = useToast();
  const [selectedVisualizers, setSelectedVisualizers] = useState<('colour' | 'text' | 'label')[]>(
    settings.shiftVisualizerTypes || [settings.shiftVisualizerType || 'colour']
  );
  
  useEffect(() => {
    // Initialize selected visualizers from settings
    if (settings.shiftVisualizerTypes) {
      setSelectedVisualizers(settings.shiftVisualizerTypes);
    } else if (settings.shiftVisualizerType) {
      setSelectedVisualizers([settings.shiftVisualizerType]);
    }
  }, [settings.shiftVisualizerTypes, settings.shiftVisualizerType]);
  
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
  
  const handleVisualizerChange = (type: 'colour' | 'text' | 'label', checked: boolean) => {
    let newVisualizers: ('colour' | 'text' | 'label')[];
    
    if (checked) {
      // Add the type if it's not already in the array
      newVisualizers = [...selectedVisualizers, type];
    } else {
      // Remove the type if it exists in the array
      // Ensure at least one visualizer is always selected
      if (selectedVisualizers.length > 1) {
        newVisualizers = selectedVisualizers.filter(v => v !== type);
      } else {
        // Don't allow removing the last visualizer
        toast({
          title: "At least one visualizer required",
          description: "You must have at least one visualization method selected.",
        });
        return;
      }
    }
    
    setSelectedVisualizers(newVisualizers);
    
    // Save both the legacy single type (using the first selected) and the new array
    onSave({
      ...settings,
      shiftVisualizerType: newVisualizers[0],
      shiftVisualizerTypes: newVisualizers
    });
  };
  
  return (
    <div className="space-y-4 p-2">
      <div className="grid gap-2">
        <div className="flex items-center space-x-2">
          <PillSwitch 
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
          <PillSwitch 
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
          <PillSwitch 
            id="show-icon-titles" 
            checked={settings.showIconTitles}
            onCheckedChange={handleShowIconTitlesChange}
          />
          <Label htmlFor="show-icon-titles">Show Icon Titles</Label>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Shift Visualizer</h3>
          <div className="flex flex-col gap-2 ml-6 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="v1" 
                checked={selectedVisualizers.includes('colour')}
                onCheckedChange={(checked) => handleVisualizerChange('colour', checked === true)}
              />
              <Label htmlFor="v1">Colour</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="v2" 
                checked={selectedVisualizers.includes('text')}
                onCheckedChange={(checked) => handleVisualizerChange('text', checked === true)}
              />
              <Label htmlFor="v2">Text</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="v3" 
                checked={selectedVisualizers.includes('label')}
                onCheckedChange={(checked) => handleVisualizerChange('label', checked === true)}
              />
              <Label htmlFor="v3">Label</Label>
            </div>
          </div>
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
