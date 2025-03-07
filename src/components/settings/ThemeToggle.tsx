import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { PillSwitch } from "@/components/ui/pill-switch";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between py-2 px-1">
      <Label htmlFor="dark-mode" className="text-base font-medium">Dark Mode</Label>
      <PillSwitch 
        checked={isDarkMode} 
        onCheckedChange={toggleTheme} 
        id="dark-mode"
      />
    </div>
  );
}