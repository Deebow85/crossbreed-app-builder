
import { Link } from "react-router-dom";
import { 
  CalendarRange, 
  Settings as SettingsIcon, 
  AlertTriangle, 
  Clipboard, 
  Calendar as CalendarIcon,
  StickyNote
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/shift-setup">
          <Card className="h-full hover:bg-accent/10 transition-colors cursor-pointer">
            <CardHeader>
              <CalendarRange className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Shift Setup</CardTitle>
              <CardDescription>Configure your shifts and working patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create and customize shift types for your schedule</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/notes-tracking">
          <Card className="h-full hover:bg-accent/10 transition-colors cursor-pointer">
            <CardHeader>
              <Clipboard className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Notes Tracker</CardTitle>
              <CardDescription>Track your work notes and reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Manage your work notes and keep track of important information</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/calendar-notes">
          <Card className="h-full hover:bg-accent/10 transition-colors cursor-pointer">
            <CardHeader>
              <StickyNote className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Calendar Notes</CardTitle>
              <CardDescription>View all your calendar-specific notes</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Access all notes created from calendar date selections</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings">
          <Card className="h-full hover:bg-accent/10 transition-colors cursor-pointer">
            <CardHeader>
              <SettingsIcon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure app preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Customize the app appearance, notification settings, and more</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-12">
        <Button asChild size="lg" className="w-full">
          <Link to="/shift-setup">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Get Started with Shift Setup
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
