
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Moon } from "lucide-react";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-2 space-y-3">
      <h3 className="text-base font-medium mb-2">Choose Theme</h3>
      <div className="grid grid-cols-2 gap-3">
        <Card
          className={`p-3 cursor-pointer hover:bg-accent transition-colors ${theme === 'light' ? 'border-2 border-primary' : ''}`}
          onClick={() => setTheme('light')}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="p-1 rounded-full bg-primary/10">
              <Sun className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Light</span>
          </div>
        </Card>

        <Card
          className={`p-3 cursor-pointer hover:bg-accent transition-colors ${theme === 'dark' ? 'border-2 border-primary' : ''}`}
          onClick={() => setTheme('dark')}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="p-1 rounded-full bg-primary/10">
              <Moon className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Dark</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
