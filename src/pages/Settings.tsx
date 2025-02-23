import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme";
import { Paintbrush, Sun, Moon, CreditCard, CalendarDays, Settings as SettingsIcon, HelpCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";

interface AppSettings {
  currency: {
    symbol: string;
    position: 'before' | 'after';
  };
  paydayDate: number;
  paydayType: 'weekly' | 'fortnightly' | 'set-day' | 'first-day' | 'last-day';
  calendarSize: 'small' | 'large';
  calendarNumberLayout: 'centre' | 'top-left' | 'top-right';
  longPressEnabled: boolean;
}

const defaultSettings: AppSettings = {
  currency: {
    symbol: '£',
    position: 'before'
  },
  paydayDate: 25,
  paydayType: 'set-day',
  calendarSize: 'small',
  calendarNumberLayout: 'centre',
  longPressEnabled: true
};

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

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showTutorial, setShowTutorial] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    calendar: false,
    theme: false,
    payment: false
  });
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

  const updateCalendarSize = (size: 'small' | 'large') => {
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

  const updatePaydaySettings = (type: AppSettings['paydayType'], date?: number) => {
    const newSettings = {
      ...settings,
      paydayType: type,
      paydayDate: date ?? settings.paydayDate
    };
    saveSettings(newSettings);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-dvh flex flex-col p-2 sm:p-4">
      <div className="flex items-center mb-2 relative">
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="absolute right-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTutorial(true)}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-auto mb-20 w-full max-w-md">
        <div className="p-2 sm:p-4 space-y-3">
          <Collapsible open={openSections.calendar} onOpenChange={() => toggleSection('calendar')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-2"
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="font-semibold">Calendar Settings</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.calendar && "transform rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 space-y-4">
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
                      saveSettings({
                        ...settings,
                        longPressEnabled: checked
                      });
                    }}
                  />
                  <Label className="text-sm">Enable long press to activate multi-select</Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.theme} onOpenChange={() => toggleSection('theme')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-2"
              >
                <div className="flex items-center gap-2">
                  <Paintbrush className="h-4 w-4" />
                  <span className="font-semibold">Theme Settings</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.theme && "transform rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2">
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
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.payment} onOpenChange={() => toggleSection('payment')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-2"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-semibold">Payday Settings</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.payment && "transform rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 space-y-4">
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
            </CollapsibleContent>
          </Collapsible>
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
