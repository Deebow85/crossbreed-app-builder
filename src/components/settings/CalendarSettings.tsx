
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AppSettings } from "@/types/settings";

interface CalendarSettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export function CalendarSettings({ settings, onSave }: CalendarSettingsProps) {
  const updateCalendarSize = (size: 'small' | 'large') => {
    onSave({
      ...settings,
      calendarSize: size
    });
  };

  const updateCalendarNumberLayout = (layout: 'centre' | 'top-left' | 'top-right') => {
    onSave({
      ...settings,
      calendarNumberLayout: layout
    });
  };

  return (
    <div className="p-2 space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Calendar Size</Label>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-8"
            variant={settings.calendarSize === 'small' ? 'default' : 'outline'}
            onClick={() => updateCalendarSize('small')}
          >
            Small
          </Button>
          <Button
            size="sm"
            className="h-8"
            variant={settings.calendarSize === 'large' ? 'default' : 'outline'}
            onClick={() => updateCalendarSize('large')}
          >
            Large
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Calendar Number Layout</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="h-8"
            variant={settings.calendarNumberLayout === 'centre' ? 'default' : 'outline'}
            onClick={() => updateCalendarNumberLayout('centre')}
          >
            Centre
          </Button>
          <Button
            size="sm"
            className="h-8"
            variant={settings.calendarNumberLayout === 'top-left' ? 'default' : 'outline'}
            onClick={() => updateCalendarNumberLayout('top-left')}
          >
            Top Left
          </Button>
          <Button
            size="sm"
            className="h-8"
            variant={settings.calendarNumberLayout === 'top-right' ? 'default' : 'outline'}
            onClick={() => updateCalendarNumberLayout('top-right')}
          >
            Top Right
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Long Press to Multi-select</Label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.longPressEnabled}
            onCheckedChange={(checked) => {
              onSave({
                ...settings,
                longPressEnabled: checked
              });
            }}
          />
          <Label className="text-sm">Enable long press to activate multi-select</Label>
        </div>
      </div>
    </div>
  );
}
