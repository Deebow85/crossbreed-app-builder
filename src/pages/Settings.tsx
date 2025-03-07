
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CreditCard, HelpCircle, Settings as SettingsIcon, Paintbrush, Clock, ChevronDown, Bell, SplitSquareHorizontal, Share } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ShareQRCode } from "@/components/ShareQRCode";
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
import { CalendarSettings } from "@/components/settings/CalendarSettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { PaydaySettings } from "@/components/settings/PaydaySettings";
import { OvertimeSettings } from "@/components/settings/OvertimeSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { ComparisonSettings } from "@/components/settings/ComparisonSettings";
import { AppSettings, defaultSettings } from "@/types/settings";

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showTutorial, setShowTutorial] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    comparison: false,
    calendar: false,
    theme: false,
    payment: false,
    overtime: false,
    notifications: false,
    sharing: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const mergedSettings = {
          ...defaultSettings,
          ...parsed,
          overtime: {
            ...defaultSettings.overtime,
            ...parsed.overtime,
            schedule: {
              ...defaultSettings.overtime.schedule,
              ...(parsed.overtime?.schedule || {})
            }
          },
          notifications: {
            ...defaultSettings.notifications,
            ...parsed.notifications
          }
        };
        setSettings(mergedSettings);
        console.log("Loaded settings:", mergedSettings);
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    console.log("Saving settings:", newSettings);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
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
        <div className="absolute right-0 flex items-center gap-2">
          <ShareQRCode />
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
          <Collapsible open={openSections.sharing} onOpenChange={() => toggleSection('sharing')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-2"
              >
                <div className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  <span className="font-semibold">Share App</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.sharing && "transform rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 flex flex-col items-center">
                <p className="text-sm text-center mb-4">Share this app with others by scanning the QR code or copying the link</p>
                <ShareQRCode />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.comparison} onOpenChange={() => toggleSection('comparison')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-2"
              >
                <div className="flex items-center gap-2">
                  <SplitSquareHorizontal className="h-4 w-4" />
                  <span className="font-semibold">Calendar Comparison</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.comparison && "transform rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ComparisonSettings settings={settings} onSave={saveSettings} />
            </CollapsibleContent>
          </Collapsible>

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
            <CollapsibleContent>
              <CalendarSettings settings={settings} onSave={saveSettings} />
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
            <CollapsibleContent>
              <ThemeSettings />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.notifications} onOpenChange={() => toggleSection('notifications')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-2"
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="font-semibold">Notifications & Alarms</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.notifications && "transform rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <NotificationSettings settings={settings} onSave={saveSettings} />
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
            <CollapsibleContent>
              <PaydaySettings settings={settings} onSave={saveSettings} />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.overtime ?? false} onOpenChange={() => toggleSection('overtime')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-2"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">Overtime Settings</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.overtime && "transform rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <OvertimeSettings settings={settings} onSave={saveSettings} />
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
            <DialogTitle>Settings Help</DialogTitle>
            <DialogDescription>
              Configure your app preferences here. Click on each section to expand and adjust settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Calendar Comparison</h3>
              <p className="text-sm text-muted-foreground">
                Configure how the calendar comparison view works.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Calendar Settings</h3>
              <p className="text-sm text-muted-foreground">
                Adjust calendar appearance and behavior.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Theme Settings</h3>
              <p className="text-sm text-muted-foreground">
                Change the app's visual theme and colors.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Payday Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure your payday schedule and notifications.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Overtime Settings</h3>
              <p className="text-sm text-muted-foreground">
                Set up overtime tracking and calculations.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTutorial(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
