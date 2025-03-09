import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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

const gradientColors = [
  '#F97316', // Orange
  '#EF4444', // Red
  '#EC4899', // Pink
  '#D946EF', // Fuchsia
  '#8B5CF6', // Purple
  '#6366F1', // Indigo
  '#0EA5E9', // Blue
  '#10B981', // Emerald
  '#84CC16', // Lime
  '#FACC15', // Yellow
  '#FB923C', // Light Orange
  '#E879F9', // Light Pink
  '#818CF8', // Light Indigo
  '#2DD4BF', // Teal
  '#4ADE80', // Green
  '#9b87f5', // Primary Purple
  '#7E69AB', // Secondary Purple
  '#6E59A5', // Tertiary Purple
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

  const handleColorChange = (value: number[]) => {
    const colorIndex = Math.floor((value[0] / 100) * (gradientColors.length - 1));
    const nextColorIndex = Math.min(colorIndex + 1, gradientColors.length - 1);
    const progress = (value[0] / 100) * (gradientColors.length - 1) - colorIndex;
    
    // Interpolate between colors
    const color1 = gradientColors[colorIndex];
    const color2 = gradientColors[nextColorIndex];
    
    // Convert hex to RGB and interpolate
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (rgb1 && rgb2) {
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * progress);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * progress);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * progress);
      
      const resultColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      onSave({
        ...settings,
        paydayColor: resultColor
      });
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
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
            <Label className="text-xs">Payday Symbol Color</Label>
            <div className="space-y-2">
              <div 
                className="h-7 rounded-md w-full"
                style={{
                  background: `linear-gradient(to right, ${gradientColors.join(', ')})`
                }}
              />
              <Slider
                defaultValue={[0]}
                max={100}
                step={1}
                className="w-full"
                onValueChange={handleColorChange}
              />
              <div 
                className="h-7 w-full rounded-md"
                style={{ backgroundColor: settings.paydayColor }}
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
