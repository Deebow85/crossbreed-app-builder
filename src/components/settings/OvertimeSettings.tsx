
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSettings } from "@/types/settings";

interface OvertimeSettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export function OvertimeSettings({ settings, onSave }: OvertimeSettingsProps) {
  return (
    <div className="p-2 space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Enable Overtime Tracking</Label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.overtime?.enabled ?? true}
            onCheckedChange={(checked) => {
              onSave({
                ...settings,
                overtime: {
                  ...settings.overtime,
                  enabled: checked
                }
              });
            }}
          />
          <Label className="text-sm">Track overtime hours and rates</Label>
        </div>
      </div>

      {settings.overtime?.enabled && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="default-rate" className="text-xs">Default Overtime Rate (×)</Label>
            <Input
              id="default-rate"
              type="number"
              step="0.1"
              min="1"
              value={settings.overtime?.defaultRate ?? 1.5}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= 1) {
                  onSave({
                    ...settings,
                    overtime: {
                      ...settings.overtime,
                      defaultRate: value
                    }
                  });
                }
              }}
              className="h-7"
            />
            <p className="text-xs text-muted-foreground">Base pay multiplier for overtime hours</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="weekend-rate" className="text-xs">Weekend Rate (×)</Label>
            <Input
              id="weekend-rate"
              type="number"
              step="0.1"
              min="1"
              value={settings.overtime?.specialRates?.weekend ?? 2}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= 1) {
                  onSave({
                    ...settings,
                    overtime: {
                      ...settings.overtime,
                      specialRates: {
                        ...settings.overtime?.specialRates,
                        weekend: value
                      }
                    }
                  });
                }
              }}
              className="h-7"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="holiday-rate" className="text-xs">Holiday Rate (×)</Label>
            <Input
              id="holiday-rate"
              type="number"
              step="0.1"
              min="1"
              value={settings.overtime?.specialRates?.holiday ?? 2.5}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= 1) {
                  onSave({
                    ...settings,
                    overtime: {
                      ...settings.overtime,
                      specialRates: {
                        ...settings.overtime?.specialRates,
                        holiday: value
                      }
                    }
                  });
                }
              }}
              className="h-7"
            />
          </div>

          <div className="space-y-4 border-t pt-4 mt-4">
            <Label className="text-xs">Recurring Overtime Schedule</Label>
            
            <Select
              value={settings.overtime.schedule?.type || 'weekly'}
              onValueChange={(value: 'weekly' | 'fortnightly' | 'monthly' | 'monthly-day' | 'full-month') => {
                onSave({
                  ...settings,
                  overtime: {
                    ...settings.overtime,
                    schedule: {
                      ...settings.overtime.schedule,
                      type: value
                    }
                  }
                });
              }}
            >
              <SelectTrigger className="h-7">
                <SelectValue placeholder="Select schedule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly (specific week)</SelectItem>
                <SelectItem value="monthly-day">Monthly (specific day)</SelectItem>
                <SelectItem value="full-month">Full Month</SelectItem>
              </SelectContent>
            </Select>

            {settings.overtime.schedule?.type && (
              <>
                {(settings.overtime.schedule?.type === 'weekly' || settings.overtime.schedule?.type === 'fortnightly') && (
                  <div className="space-y-1.5">
                    <Label htmlFor="overtime-day" className="text-xs">Day of Week</Label>
                    <Select
                      value={settings.overtime.schedule?.dayOfWeek?.toString() || "1"}
                      onValueChange={(value) => {
                        onSave({
                          ...settings,
                          overtime: {
                            ...settings.overtime,
                            schedule: {
                              ...settings.overtime.schedule,
                              dayOfWeek: parseInt(value)
                            }
                          }
                        });
                      }}
                    >
                      <SelectTrigger id="overtime-day" className="h-7">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="7">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {settings.overtime.schedule?.type === 'monthly' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="overtime-week" className="text-xs">Week of Month</Label>
                      <Select
                        value={settings.overtime.schedule?.weekNumber?.toString() || "1"}
                        onValueChange={(value) => {
                          onSave({
                            ...settings,
                            overtime: {
                              ...settings.overtime,
                              schedule: {
                                ...settings.overtime.schedule,
                                weekNumber: parseInt(value)
                              }
                            }
                          });
                        }}
                      >
                        <SelectTrigger id="overtime-week" className="h-7">
                          <SelectValue placeholder="Select week" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">First Week</SelectItem>
                          <SelectItem value="2">Second Week</SelectItem>
                          <SelectItem value="3">Third Week</SelectItem>
                          <SelectItem value="4">Fourth Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="overtime-day-of-week" className="text-xs">Day of Week</Label>
                      <Select
                        value={settings.overtime.schedule?.dayOfWeek?.toString() || "1"}
                        onValueChange={(value) => {
                          onSave({
                            ...settings,
                            overtime: {
                              ...settings.overtime,
                              schedule: {
                                ...settings.overtime.schedule,
                                dayOfWeek: parseInt(value)
                              }
                            }
                          });
                        }}
                      >
                        <SelectTrigger id="overtime-day-of-week" className="h-7">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                          <SelectItem value="7">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {settings.overtime.schedule?.type === 'monthly-day' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="overtime-day-of-month" className="text-xs">Day of Month</Label>
                    <Input
                      id="overtime-day-of-month"
                      type="number"
                      min="1"
                      max="31"
                      value={settings.overtime.schedule?.dayOfMonth || 1}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= 31) {
                          onSave({
                            ...settings,
                            overtime: {
                              ...settings.overtime,
                              schedule: {
                                ...settings.overtime.schedule,
                                dayOfMonth: value
                              }
                            }
                          });
                        }
                      }}
                      className="h-7"
                    />
                    <p className="text-xs text-muted-foreground">Enter a day between 1 and 31</p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
