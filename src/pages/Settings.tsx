import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Paintbrush, Sun, Moon, CreditCard, CalendarDays } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface ShiftTypeSettings {
  name: string;
  color: string;
  gradient: string;
}

interface AppSettings {
  currency: {
    symbol: string;
    position: 'before' | 'after';
  };
  shiftTypes: ShiftTypeSettings[];
  paydayDate: number;
  calendarSize: 'default' | 'large';
}

const defaultSettings: AppSettings = {
  currency: {
    symbol: '£',
    position: 'before'
  },
  shiftTypes: [
    {
      name: "Day",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #9F75FF 100%)"
    },
    {
      name: "Night",
      color: "#0EA5E9",
      gradient: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)"
    },
    {
      name: "OT",
      color: "#F97316",
      gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)"
    }
  ],
  paydayDate: 25,
  calendarSize: 'default'
};

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  const updateCalendarSize = (size: 'default' | 'large') => {
    saveSettings({
      ...settings,
      calendarSize: size
    });
  };

  const updateCurrency = (symbol: string) => {
    saveSettings({
      ...settings,
      currency: {
        ...settings.currency,
        symbol
      }
    });
  };

  const updateShiftType = (index: number, field: keyof ShiftTypeSettings, value: string) => {
    const newShiftTypes = [...settings.shiftTypes];
    newShiftTypes[index] = {
      ...newShiftTypes[index],
      [field]: value
    };
    saveSettings({
      ...settings,
      shiftTypes: newShiftTypes
    });
  };

  const updatePaydayDate = (date: number) => {
    if (date >= 1 && date <= 31) {
      saveSettings({
        ...settings,
        paydayDate: date
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Calendar
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendar
          </h2>
          <div className="flex items-center gap-4">
            <Button
              variant={settings.calendarSize === 'default' ? 'default' : 'outline'}
              onClick={() => updateCalendarSize('default')}
              className="flex items-center gap-2"
            >
              Default Size
            </Button>
            <Button
              variant={settings.calendarSize === 'large' ? 'default' : 'outline'}
              onClick={() => updateCalendarSize('large')}
              className="flex items-center gap-2"
            >
              Large Size
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Theme
          </h2>
          <div className="flex items-center gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Currency
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency-symbol">Symbol</Label>
              <Input
                id="currency-symbol"
                value={settings.currency.symbol}
                onChange={(e) => updateCurrency(e.target.value)}
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payday-date">Payday Date</Label>
              <Input
                id="payday-date"
                type="number"
                min={1}
                max={31}
                value={settings.paydayDate}
                onChange={(e) => updatePaydayDate(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Shift Types</h2>
          {settings.shiftTypes.map((type, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`shift-name-${index}`}>Name</Label>
                <Input
                  id={`shift-name-${index}`}
                  value={type.name}
                  onChange={(e) => updateShiftType(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`shift-color-${index}`}>Color</Label>
                <div className="flex gap-2">
                  <Input
                    id={`shift-color-${index}`}
                    type="color"
                    value={type.color}
                    onChange={(e) => updateShiftType(index, 'color', e.target.value)}
                    className="w-16"
                  />
                  <Button
                    onClick={() => {
                      const color = type.color;
                      const gradient = `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`;
                      updateShiftType(index, 'gradient', gradient);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Generate Gradient
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Settings;
