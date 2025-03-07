
import { useTheme } from "@/lib/theme";
import { ThemeToggle } from "@/components/settings/ThemeToggle";

export function ThemeSettings() {
  return (
    <div className="p-2">
      <ThemeToggle />
    </div>
  );
}
