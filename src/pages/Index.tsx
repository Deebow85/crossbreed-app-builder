
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, MessageCircle, Settings, User } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-card z-50 border-b">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">My App</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container pt-20 pb-24">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is your new mobile app. Start exploring the features below.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <MessageCircle className="h-6 w-6" />
              <span>Messages</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <User className="h-6 w-6" />
              <span>Profile</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="container grid grid-cols-3 py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Messages</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
