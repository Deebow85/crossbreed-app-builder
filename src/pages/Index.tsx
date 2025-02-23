
import Calendar from "@/components/Calendar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Calendar />
    </div>
  );
};

export default Index;
