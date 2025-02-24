
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="p-2">
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
  );
}
