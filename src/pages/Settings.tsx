import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Paintbrush, Sun, Moon, CreditCard, CalendarDays, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppSettings {
  currency: {
    symbol: string;
    position: 'before' | 'after';
  };
  paydayDate: number;
  calendarSize: 'default' | 'large';
  calendarNumberLayout: 'centre' | 'top-left' | 'top-right';
}

const defaultSettings: AppSettings = {
  currency: {
    symbol: '£',
    position: 'before'
  },
  paydayDate: 25,
  calendarSize: 'default',
  calendarNumberLayout: 'centre'
};

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showTutorial, setShowTutorial] = useState(false);
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

  const updatePaydayDate = (date: number) => {
    if (date >= 1 && date <= 31) {
      saveSettings({
        ...settings,
        paydayDate: date
      });
    }
  };

  const updateCalendarNumberLayout = (layout: 'centre' | 'top-left' | 'top-right') => {
    saveSettings({
      ...settings,
      calendarNumberLayout: layout
    });
  };

  return (
    <div className="h-dvh flex flex-col p-2 sm:p-4">
      <div className="flex justify-between items-center mb-2 relative">
        <div className="absolute right-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTutorial(true)}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="text-xl font-bold w-full text-center">Settings</h1>
      </div>

      <Card className="flex-1 overflow-auto mb-20">
        <div className="p-2 sm:p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Calendar Size
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8"
                    variant={settings.calendarSize === 'default' ? 'default' : 'outline'}
                    onClick={() => updateCalendarSize('default')}
                  >
                    Default
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
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Calendar Number Layout
                </h2>
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
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Paintbrush className="h-3.5 w-3.5" />
                Theme
              </h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-8"
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-3.5 w-3.5 mr-1" />
                  Light
                </Button>
                <Button
                  size="sm"
                  className="h-8"
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-3.5 w-3.5 mr-1" />
                  Dark
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Payment Settings
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="currency-symbol" className="text-xs mb-1">Symbol</Label>
                  <Input
                    id="currency-symbol"
                    value={settings.currency.symbol}
                    onChange={(e) => updateCurrency(e.target.value)}
                    maxLength={3}
                    className="h-7"
                  />
                </div>
                <div>
                  <Label htmlFor="payday-date" className="text-xs mb-1">Payday</Label>
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
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
        <div className="container max-w-md mx-auto flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
            onClick={() => navigate("/")}
          >
            <CalendarDays className="h-8 w-8" />
          </Button>
          
          <Button
            variant="ghost"
            className="relative p-0"
            onClick={() => navigate("/shift-setup")}
          >
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-semibold text-xl">S</span>
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
          >
            <SettingsIcon className="h-8 w-8" />
          </Button>
        </div>
      </div>

      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome to your Shift Calendar!</DialogTitle>
            <DialogDescription>
              Let's get you started with the key features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">📅 Adding Shifts</h4>
              <p>Click on any day to add a shift. Select the shift type from the buttons above the calendar.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">⌚ Setting Alarms</h4>
              <p>Middle-click on a shift to set an alarm. A bell icon will appear when an alarm is set.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📝 Adding Notes</h4>
              <p>Right-click on any day to add notes or manage shift swaps.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔄 Shift Patterns</h4>
              <p>Use the "Set Pattern" button to quickly add recurring shifts.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">💡 Pro Tips</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Click and drag to add multiple shifts at once</li>
                <li>Use the search bar to find specific notes or swaps</li>
                <li>Click the gear icon to customize the app's appearance</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTutorial(false)}>Got it, thanks!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
