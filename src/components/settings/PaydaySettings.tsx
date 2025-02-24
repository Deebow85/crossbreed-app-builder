
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSettings } from "@/types/settings";

interface PaydaySettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const currencySymbols = [
  { symbol: '£', name: 'British Pound (£)' },
  { symbol: '$', name: 'US Dollar ($)' },
  { symbol: '€', name: 'Euro (€)' },
  { symbol: '¥', name: 'Japanese Yen (¥)' },
  { symbol: '₹', name: 'Indian Rupee (₹)' },
  { symbol: '₽', name: 'Russian Ruble (₽)' },
  { symbol: '₿', name: 'Bitcoin (₿)' },
  { symbol: '₴', name: 'Ukrainian Hryvnia (₴)' },
  { symbol: '₩', name: 'South Korean Won (₩)' },
  { symbol: 'A$', name: 'Australian Dollar (A$)' },
  { symbol: 'C$', name: 'Canadian Dollar (C$)' },
  { symbol: 'CHF', name: 'Swiss Franc (CHF)' },
];

const predefinedColors = [
  { name: 'Orange', value: '#F97316' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#D946EF' },
  { name: 'Blue', value: '#0EA5E9' },
  { name: 'Primary Purple', value: '#9b87f5' },
  { name: 'Secondary Purple', value: '#7E69AB' },
  { name: 'Tertiary Purple', value: '#6E59A5' },
];

export function PaydaySettings({ settings, onSave }: PaydaySettingsProps) {
  const updateCurrency = (symbol: string) => {
    onSave({
      ...settings,
      currency: {
        ...settings.currency,
        symbol
      }
    });
  };

  const updatePaydayDate = (date: number) => {
    if (date >= 1 && date <= 31) {
      onSave({
        ...settings,
        paydayDate: date
      });
    }
  };

  const updatePaydaySettings = (type: AppSettings['paydayType'], date?: number) => {
    onSave({
      ...settings,
      paydayType: type,
      paydayDate: date ?? settings.paydayDate
    });
  };

  const updatePaydayColor = (color: string) => {
    onSave({
      ...settings,
      paydayColor: color
    });
  };

  return (
    <div className="p-2 space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Enable Payday Tracking</Label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.paydayEnabled ?? true}
            onCheckedChange={(checked) => {
              onSave({
                ...settings,
                paydayEnabled: checked
              });
            }}
          />
          <Label className="text-sm">Track payday schedule</Label>
        </div>
      </div>

      {settings.paydayEnabled && (
        <>
          <div className="space-y-1">
            <Label htmlFor="currency-symbol" className="text-xs">Currency</Label>
            <Select
              value={settings.currency.symbol}
              onValueChange={updateCurrency}
            >
              <SelectTrigger id="currency-symbol" className="h-7">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencySymbols.map(({ symbol, name }) => (
                  <SelectItem key={symbol} value={symbol}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="payday-color" className="text-xs">Payday Symbol Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {predefinedColors.map(({ name, value }) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  className={`h-8 w-full relative ${settings.paydayColor === value ? 'ring-2 ring-primary' : ''}`}
                  style={{ backgroundColor: value }}
                  onClick={() => updatePaydayColor(value)}
                  title={name}
                />
              ))}
              <Input
                id="payday-color"
                type="color"
                value={settings.paydayColor}
                onChange={(e) => updatePaydayColor(e.target.value)}
                className="h-8 p-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Payday Schedule</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                className="h-8"
                variant={settings.paydayType === 'weekly' ? 'default' : 'outline'}
                onClick={() => updatePaydaySettings('weekly')}
              >
                Weekly
              </Button>
              <Button
                size="sm"
                className="h-8"
                variant={settings.paydayType === 'fortnightly' ? 'default' : 'outline'}
                onClick={() => updatePaydaySettings('fortnightly')}
              >
                Fortnightly
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Monthly Options</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                className="h-8"
                variant={settings.paydayType === 'set-day' ? 'default' : 'outline'}
                onClick={() => updatePaydaySettings('set-day')}
              >
                Set Day
              </Button>
              <Button
                size="sm"
                className="h-8"
                variant={settings.paydayType === 'first-day' ? 'default' : 'outline'}
                onClick={() => updatePaydaySettings('first-day', 1)}
              >
                First Day
              </Button>
              <Button
                size="sm"
                className="h-8"
                variant={settings.paydayType === 'last-day' ? 'default' : 'outline'}
                onClick={() => updatePaydaySettings('last-day', 31)}
              >
                Last Day
              </Button>
            </div>
          </div>

          {settings.paydayType === 'set-day' && (
            <div>
              <Label htmlFor="payday-date" className="text-xs mb-1">Day of Month</Label>
              <Input
                id="payday-date"
                type="number"
                min={1}
                max={31}
                value={settings.paydayDate}
                onChange={(e) => updatePaydayDate(parseInt(e.target.value))}
                className="h-7"
              />
            </div>
          )}

          {(settings.paydayType === 'weekly' || settings.paydayType === 'fortnightly') && (
            <div>
              <Label htmlFor="payday-weekday" className="text-xs mb-1">Day of Week</Label>
              <Select
                value={settings.paydayDate.toString()}
                onValueChange={(value) => updatePaydayDate(parseInt(value))}
              >
                <SelectTrigger id="payday-weekday" className="h-7">
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
        </>
      )}
    </div>
  );
}
