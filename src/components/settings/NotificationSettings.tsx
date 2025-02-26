
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSettings } from "@/types/settings";
import { useState } from "react";

interface NotificationSettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export function NotificationSettings({ settings, onSave }: NotificationSettingsProps) {
  const [defaultReminderTime, setDefaultReminderTime] = useState(
    settings.notifications?.defaultReminderTime || "01:00"
  );

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultReminderTime(e.target.value);
  };

  const saveNotificationSettings = () => {
    onSave({
      ...settings,
      notifications: {
        ...settings.notifications,
        enabled: settings.notifications?.enabled ?? true,
        defaultReminderTime,
        sound: settings.notifications?.sound ?? true,
        vibration: settings.notifications?.vibration ?? true
      }
    });
  };

  return (
    <div className="p-2 space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Enable Notifications</Label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.notifications?.enabled ?? true}
            onCheckedChange={(checked) => {
              onSave({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  enabled: checked
                }
              });
            }}
          />
          <Label className="text-sm">Allow shift reminders and alarm notifications</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs" htmlFor="default-reminder">Default Reminder Time (before shift)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="default-reminder"
            type="time"
            value={defaultReminderTime}
            onChange={handleTimeChange}
            onBlur={saveNotificationSettings}
            className="w-24"
          />
          <Label className="text-sm">before shift start</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Sound Notifications</Label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.notifications?.sound ?? true}
            onCheckedChange={(checked) => {
              onSave({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  sound: checked
                }
              });
            }}
          />
          <Label className="text-sm">Play sound for alarms and notifications</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Vibration</Label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.notifications?.vibration ?? true}
            onCheckedChange={(checked) => {
              onSave({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  vibration: checked
                }
              });
            }}
          />
          <Label className="text-sm">Vibrate device for alarms and notifications</Label>
        </div>
      </div>
    </div>
  );
}
