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
    <div className="h-full flex flex-col p-4 max-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Calendar
        </Button>
      </div>

      <Card className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Calendar Size
              </h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={settings.calendarSize === 'default' ? 'default' : 'outline'}
                  onClick={() => updateCalendarSize('default')}
                >
                  Default
                </Button>
                <Button
                  size="sm"
                  variant={settings.calendarSize === 'large' ? 'default' : 'outline'}
                  onClick={() => updateCalendarSize('large')}
                >
                  Large
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                Theme
              </h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Light
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Dark
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Settings
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="currency-symbol" className="text-sm">Symbol</Label>
                  <Input
                    id="currency-symbol"
                    value={settings.currency.symbol}
                    onChange={(e) => updateCurrency(e.target.value)}
                    maxLength={3}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="payday-date" className="text-sm">Payday</Label>
                  <Input
                    id="payday-date"
                    type="number"
                    min={1}
                    max={31}
                    value={settings.paydayDate}
                    onChange={(e) => updatePaydayDate(parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Shift Types</h2>
            <div className="grid gap-2">
              {settings.shiftTypes.map((type, index) => (
                <div key={index} className="flex gap-2 items-center p-2 border rounded-lg">
                  <Input
                    value={type.name}
                    onChange={(e) => updateShiftType(index, 'name', e.target.value)}
                    className="w-24 h-8"
                    placeholder="Name"
                  />
                  <Input
                    type="color"
                    value={type.color}
                    onChange={(e) => updateShiftType(index, 'color', e.target.value)}
                    className="w-16 h-8"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      const color = type.color;
                      const gradient = `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`;
                      updateShiftType(index, 'gradient', gradient);
                    }}
                    variant="outline"
                    className="flex-1 h-8"
                  >
                    Generate Gradient
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
