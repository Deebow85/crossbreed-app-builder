
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Settings, CheckSquare } from "lucide-react";
import { AppSettings, defaultSettings } from "@/types/settings";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSelectingMultiple, setIsSelectingMultiple] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  // Add dependency on location to refresh settings when navigating
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({
            ...defaultSettings,
            ...parsedSettings,
            overtime: {
              ...defaultSettings.overtime,
              ...parsedSettings.overtime,
              schedule: {
                ...defaultSettings.overtime.schedule,
                ...(parsedSettings.overtime?.schedule || {})
              }
            }
          });
        } catch (e) {
          console.error("Error parsing settings:", e);
        }
      }
    };
    
    loadSettings();
    
    // Add event listener to catch settings changes
    window.addEventListener('storage', loadSettings);
    
    return () => {
      window.removeEventListener('storage', loadSettings);
    };
  }, [location]); // Add location as dependency to refresh on navigation
  
  const isIndexPage = location.pathname === "/";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Outlet context={{ isSelectingMultiple }} />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t py-2 z-50">
        <div className="container max-w-md mx-auto flex justify-between items-center px-4">
          <div className="flex gap-2">
            <Button 
              variant={isIndexPage ? "ghost" : "ghost"}
              size="icon"
              className="flex flex-col items-center justify-center h-16 w-16 rounded-none"
              onClick={() => navigate("/")}
            >
              <CalendarDays className="h-6 w-6" />
              {settings.showIconTitles && <span className="text-xs mt-1">Calendar</span>}
            </Button>
            
            {isIndexPage && (
              <Button
                variant={isSelectingMultiple ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setIsSelectingMultiple(!isSelectingMultiple)}
                className="flex flex-col items-center justify-center h-16 w-16 rounded-none"
              >
                <CheckSquare className="h-6 w-6" />
                {settings.showIconTitles && <span className="text-xs mt-1">Multi Select</span>}
              </Button>
            )}
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2">
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center h-16 w-16 rounded-none p-0"
              onClick={() => navigate("/shift-setup")}
            >
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-semibold text-xl">S</span>
              </div>
            </Button>
          </div>
          
          <div className="flex" style={{ width: '150px', marginLeft: '10px' }}>
            <div className="flex-1 flex justify-end">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center justify-center h-16 w-16 rounded-none"
                onClick={() => console.log("N button clicked")}
              >
                <div className="h-8 w-8 border-2 border-foreground rounded-md flex items-center justify-center">
                  <span className="font-semibold text-foreground text-xs">N/T</span>
                </div>
                {settings.showIconTitles && <span className="text-xs mt-1">Notes / Tracking</span>}
              </Button>
            </div>
            
            <div className="flex-1 flex justify-end">
              <Button 
                variant="ghost" 
                className={`flex flex-col items-center justify-center h-16 w-16 rounded-none ${location.pathname === "/settings" ? "bg-accent" : ""}`}
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-6 w-6" />
                {settings.showIconTitles && <span className="text-xs mt-1">Settings</span>}
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
